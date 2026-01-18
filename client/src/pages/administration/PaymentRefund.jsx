import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import ModalAlert from "../../components/ModalAlert";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function PaymentRefund() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa } = useHoa();

  const [searchFilters, setSearchFilters] = useState({
    unitnumber: "",
    plate: "",
    firstname: "",
    lastname: "",
    startDate: "",
    endDate: ""
  });

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      params.append("hoaid", hoaId);
      if (searchFilters.unitnumber) params.append("unitnumber", searchFilters.unitnumber);
      if (searchFilters.plate) params.append("plate", searchFilters.plate);
      if (searchFilters.firstname) params.append("firstname", searchFilters.firstname);
      if (searchFilters.lastname) params.append("lastname", searchFilters.lastname);
      if (searchFilters.startDate) params.append("startDate", searchFilters.startDate);
      if (searchFilters.endDate) params.append("endDate", searchFilters.endDate);
      console.log('PAYMENT REFUND search params are', params.toString())

      const response = await axios.get(`/payments?${params}`);
      setPayments(response.data);
      setSelectedPayment(null);

      if (response.data.length === 0) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "No Payments Found",
          message: "No payments found matching your search criteria",
          onConfirm: () => setModal({ ...modal, isOpen: false })
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Search Error",
        message: error.response?.data?.message || "Error searching payments",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setRefundAmount("");
    setRefundReason("");
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPayment) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "No Payment Selected",
        message: "Please select a payment to refund",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Invalid Amount",
        message: "Please enter a valid refund amount",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    const maxRefund = selectedPayment.sq_amount / 100;
    if (parseFloat(refundAmount) > maxRefund) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Amount Exceeds Original Payment",
        message: `Refund amount cannot exceed $${maxRefund.toFixed(2)}`,
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    setModal({
      isOpen: true,
      type: "confirm",
      title: "Confirm Refund",
      message: `Process refund of $${parseFloat(refundAmount).toFixed(2)} for ${selectedPayment.firstname} ${selectedPayment.lastname} (${selectedPayment.plate})?`,
      confirmText: "Process",
      cancelText: "Cancel",
      onConfirm: processRefund,
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  const processRefund = async () => {
    setLoading(true);
    try {
      await axios.post("/payments/refund", {
        paymentId: selectedPayment._id,
        refundAmount: parseFloat(refundAmount),
        refundReason: refundReason || "Partial refund issued"
      });

      setModal({
        isOpen: true,
        type: "success",
        title: "Refund Processed",
        message: `Refund of $${parseFloat(refundAmount).toFixed(2)} has been successfully processed`,
        onConfirm: () => {
          setModal({ ...modal, isOpen: false });
          handleSearch({ preventDefault: () => { } });
          setSelectedPayment(null);
          setRefundAmount("");
          setRefundReason("");
        }
      });
    } catch (error) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Refund Error",
        message: error.response?.data?.message || "Error processing refund",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <DashboardNavbar title="Payment Refunds" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>Process Payment Refunds</h1>
        </div>

        <div className="grid-flex-container">
          <section className="standardsection-wide">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Search Payments</h3>
            <form onSubmit={handleSearch}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Unit Number</label>
                  <input className="standardinput"
                    type="text"
                    name="unitnumber"
                    value={searchFilters.unitnumber}
                    onChange={handleFilterChange}
                    placeholder="e.g., 101"
                    // style={{
                    //   width: "100%",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>License Plate</label>
                  <input className="standardinput"
                    type="text"
                    name="plate"
                    value={searchFilters.plate}
                    onChange={handleFilterChange}
                    placeholder="e.g., ABC123"
                    // style={{
                    //   width: "100%",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>First Name</label>
                  <input className="standardinput"
                    type="text"
                    name="firstname"
                    value={searchFilters.firstname}
                    onChange={handleFilterChange}
                    placeholder="Owner first name"
                    // style={{
                    //   width: "100%",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Last Name</label>
                  <input className="standardinput"
                    type="text"
                    name="lastname"
                    value={searchFilters.lastname}
                    onChange={handleFilterChange}
                    placeholder="Owner last name"
                    // style={{
                    //   width: "100%",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
                <div className="xfull-row">
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Start Date</label>
                  <input  className="input-date"
                    type="date"
                    name="startDate"
                    value={searchFilters.startDate}
                    onChange={handleFilterChange}
                    // style={{
                    //   // width: "100%",
                    //   // maxWidth: "160px",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
                <div  className="xfull-row">
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>End Date</label>
                  <input  className="input-date"
                    type="date"
                    name="endDate"
                    value={searchFilters.endDate}
                    onChange={handleFilterChange}
                    // style={{
                    //   // width: "100%",
                    //   // maxWidth: "160px",
                    //   padding: "10px",
                    //   border: "1px solid #ddd",
                    //   borderRadius: "4px",
                    //   boxSizing: "border-box"
                    // }}
                  />
                </div>
              </div>
              <div className="button-grid">
                <button
                  type="submit"
                  disabled={searching}
                  className="btn btn-primary"
                  style={{
                    opacity: searching ? 0.6 : 1,
                    cursor: searching ? "not-allowed" : "pointer"
                  }}
                >
                  {searching ? "Searching..." : "Search Payments"}
                </button>
              </div>
            </form>
          </section>

          {payments.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '20px'
              }}>

                {payments.map((payment) => (
                  <div className="grid-container-3_oldhoa" key={payment._id}>

                    <div className="grid-item-bold">Date</div>
                    <div className="grid-item-bold">Name</div>
                    <div className="grid-item-bold">Days</div>


                    <div className="grid-item-normal" >{new Date(payment.sq_paymentDate).toLocaleDateString()}</div>
                    <div className="grid-item-normal">{payment.lastname}, {payment.firstname}</div>
                    <div className="grid-item-normal">{payment.numdays}</div>

                    <div className="grid-item-bold">Unit</div>
                    <div className="grid-item-bold">Plate</div>
                    <div className="grid-item-bold">Amount</div>

                    <div className="grid-item-normal">{payment.unitnumber}</div>
                    <div className="grid-item-normal">{payment.plate}</div>
                    <div className="grid-item-normal">${(payment.sq_amount / 100).toFixed(2)}</div>

                     <div className="grid-item-bold">Status</div>
                    <div className="grid-item-bold">&nbsp;</div>
                    <div className="grid-item-bold">Refunded</div>

                    <div className="grid-item-normal">
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: payment.status === "completed" ? "#d4edda" : "#f8d7da",
                        color: payment.status === "completed" ? "#155724" : "#721c24"
                      }}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid-item-normal">
                      <div className="button-grid" style={{display:'flex',width:"100px",justifySelf:"start"}}>
                     
                       <button
                        onClick={() => handleSelectPayment(payment)}
                        className="btnxs btn-primary"
                      >
                        {selectedPayment?._id === payment._id ? "Selected" : "Select"}
                      </button>
                      </div>
                    </div>
                    <div className="grid-item-normal">${(payment.totalRefunded/100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
          )}

          {selectedPayment && (
            <section className="standardsection-wide" style={{ marginTop: "30px" }}>
              <h3 style={{ color: "#1976d2", marginTop: 0 }}>Refund Details</h3>
              <div style={{
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "4px",
                marginBottom: "20px",
                border: "1px solid #ddd"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <strong>Owner:</strong> <br /> {selectedPayment.firstname}, {selectedPayment.lastname}
                  </div>


                  <div>
                    <strong>Unit:</strong><br /> {selectedPayment.unitnumber}
                  </div>


                  <div>
                    <strong>Plate:</strong><br /> {selectedPayment.plate}
                  </div>
                  <div>
                    <strong>Original Amount:</strong><br /> ${(selectedPayment.sq_amount / 100).toFixed(2)}
                  </div>
                  <div>
                    <strong>Payment Date:</strong><br /> {new Date(selectedPayment.sq_paymentDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Days Paid:</strong><br /> {selectedPayment.numdays}
                  </div>
                </div>
              </div>

              <form onSubmit={handleRefundSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                    Refund Amount (Max: ${(selectedPayment.sq_amount / 100).toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      opacity: loading ? 0.6 : 1
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>Reason for Refund</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    <option value="">-- Select a reason --</option>
                    <option value="Shortened stay">Shortened stay</option>
                    <option value="Customer request">Customer request</option>
                    <option value="Duplicate charge">Duplicate charge</option>
                    <option value="Service issue">Service issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="button-grid">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Processing..." : "Process Refund"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayment(null)}
                    disabled={loading}
                    className="btn btn-default"
                    style={{
                      backgroundColor: "#999",
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}
