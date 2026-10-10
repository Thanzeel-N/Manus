"use client";

import { useState } from "react";
import Icon from "./icon";
import { showroomPhotos } from "../lib/showroom-photos";
import { useContactModal } from "./contact-modal";

export default function ShowroomSpaces() {
  const [activeSpaceId, setActiveSpaceId] = useState(showroomPhotos[0].id);
  const { openContactModal } = useContactModal();

  const activeSpace = showroomPhotos.find((s) => s.id === activeSpaceId) || showroomPhotos[0];

  return (
    <div className="p-showroom-spaces-widget">
      {/* Space Selector Tabs */}
      <div className="p-space-tabs" role="tablist" aria-label="Showroom facilities">
        {showroomPhotos.map((space) => {
          const isActive = space.id === activeSpaceId;
          return (
            <button
              key={space.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`space-panel-${space.id}`}
              id={`space-tab-${space.id}`}
              className={`p-space-tab ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveSpaceId(space.id)}
            >
              <span className="p-space-tab-category">{space.category}</span>
              <strong className="p-space-tab-title">{space.title}</strong>
            </button>
          );
        })}
      </div>

      {/* Featured Active Space Showcase */}
      <div
        id={`space-panel-${activeSpace.id}`}
        role="tabpanel"
        aria-labelledby={`space-tab-${activeSpace.id}`}
        className="p-active-space-card"
      >
        <div className="p-active-space-media">
          <img
            src={activeSpace.src}
            alt={activeSpace.alt}
            width={1600}
            height={900}
            loading="eager"
            className="p-active-space-img"
          />
          <div className="p-active-space-badge">
            <Icon name={activeSpace.icon} size={16} />
            <span>{activeSpace.category}</span>
          </div>
        </div>

        <div className="p-active-space-content">
          <p className="p-eyebrow">FACILITY HIGHLIGHT</p>
          <h3>{activeSpace.title}</h3>
          <p className="p-active-space-desc">{activeSpace.caption}</p>

          <div className="p-active-space-highlights">
            {activeSpace.highlights?.map((highlight) => (
              <div key={highlight} className="p-space-highlight-pill">
                <Icon name="check" size={14} />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="p-active-space-actions">
            <button
              type="button"
              className="p-button"
              onClick={() =>
                openContactModal({
                  title: `Visit ${activeSpace.title}`,
                  interest: "Visiting the showroom",
                })
              }
            >
              Schedule a visit here
              <Icon name="northeast" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
