import React, { useState } from "react";

export default function Accordion({ items }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleItem = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const accordionStyles = `
    .accordion-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      width: 100%;
    }

    .accordion-item {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .accordion-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0px;
      background-color: #1976d2;
      color: white;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      transition: background-color 0.2s;
      min-height: 40px;
    }

    .accordion-header:hover {
      background-color: #1565c0;
    }

    .accordion-toggle {
      font-size: 14px;
      transition: transform 0.2s;
    }

    .accordion-toggle.open {
      transform: rotate(180deg);
    }

    .accordion-content {
      padding: 0px;
      border-top: 0px solid #e0e0e0;
      background-color: #fafafa;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .accordion-content.open {
      max-height: 500px;
    }

    .accordion-detail {
     
      padding: 5px 0;
      border-bottom: 1px solid #000;
    }

     .xaccordion-detail {
      display: flex;
      justify-content:flex-start;
      padding: 5px 0;
      border-bottom: 0px solid #e0e0e0;
    }

    .accordion-detail:last-child {
      border-bottom: none;
    }

    .accordion-label {
      font-weight: bold;
      color: #555;
    
    }

    .accordion-value {
      color: #333;
    
    }
  `;

  return (
    <>
      <style>{accordionStyles}</style>
      <div className="accordion-container">
        {items.map((item, index) => (
          <div key={index} className="accordion-item">
            <div
              className="accordion-header"
              onClick={() => toggleItem(index)}
            >
              <div>{item.title}</div>
              {/* <span
                className={`accordion-toggle ${
                  expandedIndex === index ? "open" : ""
                }`}
              >
                ▼
              </span> */}
            </div>
            <div
              className={`accordion-content ${
                expandedIndex === index ? "open" : ""
              }`}
            >
              {item.details.map((detail, detailIndex) => (
                <>
                <div key={detailIndex} className="accordion-detail">
                  <div className="accordion-label">{detail.label}</div>
                 
                  <div className="accordion-value">{detail.value}</div>
                </div>
                </>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
