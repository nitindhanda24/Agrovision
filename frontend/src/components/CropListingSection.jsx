import { useState } from "react";
import { resolveImageUrl } from "../api/api";

const fallbackCropImage = "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1000&q=60";
const unitOptions = ["kg", "quintal", "ton", "bag"];
const cropTypeOptions = ["grains", "vegetables", "oilseeds", "pulses", "spices", "cash crops", "fruits"];
const mandiOptions = ["Pune APMC", "Hadapsar Mandi", "Pimpri Mandi", "Wagholi Mandi", "Chinchwad Mandi"];

function formatPriceWithUnit(price, unit) {
  const numericPrice = Number(price);
  const safeUnit = unit || "kg";

  if (Number.isNaN(numericPrice)) {
    return `\u20b90 per ${safeUnit}`;
  }

  return `\u20b9${numericPrice.toLocaleString("en-IN")} per ${safeUnit}`;
}

export default function CropListingSection({
  crops,
  role,
  title = "Crop Listings",
  description,
  loading = false,
  emptyMessage = "No crops available right now.",
  onListingUpdate,
  onListingCreate,
  savingCropId = "",
  creatingCrop = false,
  uploadingCropId = "",
  onImageSelect
}) {
  const [editingCropId, setEditingCropId] = useState("");
  const [draftValues, setDraftValues] = useState({
    name: "",
    price: "",
    unit: "kg",
    imageUrl: ""
  });
  const [newCropValues, setNewCropValues] = useState({
    name: "",
    cropType: "grains",
    price: "",
    quantity: "",
    mandi: "Pune APMC",
    unit: "kg",
    imageUrl: ""
  });
  const isTrader = role === "trader";

  const beginEdit = (crop) => {
    setEditingCropId(crop._id);
    setDraftValues({
      name: crop.name || "",
      price: String(crop.price ?? ""),
      unit: crop.unit || "kg",
      imageUrl: crop.imageUrl || ""
    });
  };

  const cancelEdit = () => {
    setEditingCropId("");
    setDraftValues({
      name: "",
      price: "",
      unit: "kg",
      imageUrl: ""
    });
  };

  const saveListing = async (cropId) => {
    if (!onListingUpdate) return;

    const nextName = draftValues.name.trim();
    const nextPrice = Number(draftValues.price);
    if (!nextName || Number.isNaN(nextPrice) || nextPrice < 0) {
      return;
    }

    const updated = await onListingUpdate(cropId, {
      name: nextName,
      price: nextPrice,
      unit: draftValues.unit,
      imageUrl: draftValues.imageUrl
    });

    if (updated !== false) {
      cancelEdit();
    }
  };

  const addNewListing = async () => {
    if (!onListingCreate) return;

    const nextName = newCropValues.name.trim();
    const nextPrice = Number(newCropValues.price);
    const nextQuantity = Number(newCropValues.quantity);
    if (!nextName || Number.isNaN(nextPrice) || nextPrice < 0 || Number.isNaN(nextQuantity) || nextQuantity < 0) {
      return;
    }

    const created = await onListingCreate({
      name: nextName,
      cropType: newCropValues.cropType,
      price: nextPrice,
      quantity: nextQuantity,
      mandi: newCropValues.mandi,
      unit: newCropValues.unit,
      imageUrl: newCropValues.imageUrl
    });

    if (created !== false) {
      setNewCropValues({
        name: "",
        cropType: "grains",
        price: "",
        quantity: "",
        mandi: "Pune APMC",
        unit: "kg",
        imageUrl: ""
      });
    }
  };

  return (
    <section className="panel crop-listing-panel">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          {description && <p className="muted">{description}</p>}
        </div>
      </div>

      {isTrader && (
        <div className="crop-new-listing-card">
          <div className="section-heading">
            <div>
              <h4>Add New Crop Listing</h4>
              <p className="muted">Create a fresh crop card directly from the trader listings page.</p>
            </div>
          </div>
          <div className="crop-editor-card">
            <div className="field-group">
              <label htmlFor="new-crop-name">Crop Name</label>
              <input
                id="new-crop-name"
                value={newCropValues.name}
                onChange={(event) => setNewCropValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="Crop name"
              />
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-type">Crop Type</label>
              <select
                id="new-crop-type"
                value={newCropValues.cropType}
                onChange={(event) => setNewCropValues((current) => ({ ...current, cropType: event.target.value }))}
              >
                {cropTypeOptions.map((cropType) => (
                  <option key={cropType} value={cropType}>
                    {cropType}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-price">Price</label>
              <input
                id="new-crop-price"
                type="number"
                min="0"
                value={newCropValues.price}
                onChange={(event) => setNewCropValues((current) => ({ ...current, price: event.target.value }))}
                placeholder="Price"
              />
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-quantity">Quantity</label>
              <input
                id="new-crop-quantity"
                type="number"
                min="0"
                value={newCropValues.quantity}
                onChange={(event) => setNewCropValues((current) => ({ ...current, quantity: event.target.value }))}
                placeholder="Quantity"
              />
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-mandi">Mandi</label>
              <select
                id="new-crop-mandi"
                value={newCropValues.mandi}
                onChange={(event) => setNewCropValues((current) => ({ ...current, mandi: event.target.value }))}
              >
                {mandiOptions.map((mandi) => (
                  <option key={mandi} value={mandi}>
                    {mandi}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-unit">Unit</label>
              <select
                id="new-crop-unit"
                value={newCropValues.unit}
                onChange={(event) => setNewCropValues((current) => ({ ...current, unit: event.target.value }))}
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="new-crop-image">Crop Image</label>
              <div className="crop-image-picker">
                <input
                  id="new-crop-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => onImageSelect?.("__new__", event, setNewCropValues)}
                />
                {uploadingCropId === "__new__" && <span className="muted">Uploading image...</span>}
              </div>
            </div>

            <div className="crop-card-actions">
              <button type="button" onClick={addNewListing} disabled={creatingCrop || uploadingCropId === "__new__"}>
                {creatingCrop ? "Adding..." : "Add Crop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading crops...</p>
      ) : crops.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <div className="crop-listing-grid">
          {crops.map((crop) => {
            const cropImage = resolveImageUrl(crop.imageUrl) || fallbackCropImage;
            const isEditing = editingCropId === crop._id;
            const isSaving = savingCropId === crop._id;
            const isUploading = uploadingCropId === crop._id;
            const previewImage = isEditing ? resolveImageUrl(draftValues.imageUrl) || cropImage : cropImage;

            return (
              <article key={crop._id} className="crop-listing-card-large">
                <div className="crop-listing-media">
                  <img className="crop-listing-image-large" src={previewImage} alt={crop.name} />
                </div>

                <div className="crop-listing-content">
                  <div className="crop-listing-header">
                    <div>
                      <h4>{crop.name}</h4>
                      {crop.cropType && <p className="muted crop-listing-type">{crop.cropType}</p>}
                    </div>
                    <span className="tag approved">Listing</span>
                  </div>

                  {isTrader && isEditing ? (
                    <div className="crop-editor-card">
                      <div className="field-group">
                        <label htmlFor={`name-${crop._id}`}>Crop Name</label>
                        <input
                          id={`name-${crop._id}`}
                          value={draftValues.name}
                          onChange={(event) => setDraftValues((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Crop name"
                        />
                      </div>

                      <div className="field-group">
                        <label htmlFor={`price-${crop._id}`}>Price</label>
                        <input
                          id={`price-${crop._id}`}
                          type="number"
                          min="0"
                          value={draftValues.price}
                          onChange={(event) => setDraftValues((current) => ({ ...current, price: event.target.value }))}
                          placeholder="Price"
                        />
                      </div>

                      <div className="field-group">
                        <label htmlFor={`unit-${crop._id}`}>Unit</label>
                        <select
                          id={`unit-${crop._id}`}
                          value={draftValues.unit}
                          onChange={(event) => setDraftValues((current) => ({ ...current, unit: event.target.value }))}
                        >
                          {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group">
                        <label htmlFor={`image-${crop._id}`}>Crop Image</label>
                        <div className="crop-image-picker">
                          <input
                            id={`image-${crop._id}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) => onImageSelect?.(crop._id, event, setDraftValues)}
                          />
                          {isUploading && <span className="muted">Uploading image...</span>}
                        </div>
                      </div>

                      <div className="crop-card-actions">
                        <button type="button" onClick={() => saveListing(crop._id)} disabled={isSaving || isUploading}>
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button type="button" className="secondary" onClick={cancelEdit} disabled={isSaving || isUploading}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="crop-card-metrics">
                        <div className="crop-metric">
                          <span className="muted">Price</span>
                          <p className="value crop-card-price">{formatPriceWithUnit(crop.price, crop.unit)}</p>
                        </div>
                      </div>

                      {isTrader && (
                        <div className="crop-card-actions">
                          <button type="button" className="secondary" onClick={() => beginEdit(crop)}>
                            Edit
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
