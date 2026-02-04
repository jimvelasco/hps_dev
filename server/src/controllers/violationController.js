import Violation from "../models/Violation.js";

const getViolationsByHoaId = async (req, res) => {
  try {
    const { hoaId } = req.params;

   // const violations = (await Violation.find({ hoaid: hoaId })).sort({ 'violation_plate': 1 });
     const violations = (await Violation.find({ hoaid: hoaId }).sort({ violation_plate: 1 ,violation_date:-1}));
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getViolationById = async (req, res) => {
  try {
    const { violationId } = req.params;

    const violation = await Violation.findById(violationId);

    if (!violation) {
      return res.status(404).json({ message: "Violation not found" });
    }

    res.json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createViolation = async (req, res) => {
  try {
    const violationData = req.body;

    const violation = await Violation.create(violationData);

    res.status(201).json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateViolation = async (req, res) => {
  try {
    const { violationId } = req.params;
    const violationData = req.body;

    const violation = await Violation.findByIdAndUpdate(violationId, violationData, { new: true });

    if (!violation) {
      return res.status(404).json({ message: "Violation not found" });
    }

    res.status(200).json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteViolation = async (req, res) => {
  try {
    const { violationId } = req.params;

    const violation = await Violation.findByIdAndDelete(violationId);

    if (!violation) {
      return res.status(404).json({ message: "Violation not found" });
    }

    res.status(200).json({ message: "Violation deleted successfully", violation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getViolationsByHoaId,
  getViolationById,
  createViolation,
  updateViolation,
  deleteViolation
};
