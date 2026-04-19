import { useEffect, useState } from "react";
import { API, getErrorMessage } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CropListingSection from "../components/CropListingSection";
import { getStoredValue } from "../utils/storage";

export default function CropListings({ navigate, path }) {
  const role = getStoredValue("role");
  const isTrader = role === "trader";
  const userId = getStoredValue("userId");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingCropId, setSavingCropId] = useState("");
  const [uploadingCropId, setUploadingCropId] = useState("");
  const [creatingCrop, setCreatingCrop] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load crop listings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateCropListing = async (cropId, updates) => {
    const previousProducts = products;

    setError("");
    setMessage("");
    setSavingCropId(cropId);
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product._id === cropId ? { ...product, ...updates } : product
      )
    );

    try {
      try {
        await API.put(`/products/${cropId}/listing`, updates);
      } catch (err) {
        if (err?.response?.status !== 404) {
          throw err;
        }

        await API.put(`/products/${cropId}/price`, updates);
      }
      setMessage("Crop listing updated");
      return true;
    } catch (err) {
      setProducts(previousProducts);
      setError(getErrorMessage(err, "Could not update crop listing"));
      return false;
    } finally {
      setSavingCropId("");
    }
  };

  const createCropListing = async (newCrop) => {
    setError("");
    setMessage("");
    setCreatingCrop(true);

    try {
      const res = await API.post("/products", {
        ...newCrop,
        farmerId: userId
      });
      setProducts((currentProducts) => [res.data, ...currentProducts]);
      setMessage("Crop listing added");
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Could not add crop listing"));
      return false;
    } finally {
      setCreatingCrop(false);
    }
  };

  const uploadCropImage = async (cropId, event, setDraftValues) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setMessage("");
      setUploadingCropId(cropId);

      const body = new FormData();
      body.append("image", file);

      const res = await API.post("/products/upload-image", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setDraftValues((current) => ({
        ...current,
        imageUrl: res.data.imageUrl
      }));
      setMessage("Crop image uploaded");
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload crop image"));
    } finally {
      setUploadingCropId("");
      event.target.value = "";
    }
  };

  const title = isTrader ? "Market Crop Listings" : "My Crop Listings";
  const description = isTrader
    ? "View crop name, image, and price, then edit listings or add a new crop inline."
    : "View crop name, price, and image in a simple listing format.";

  return (
    <div className="app-shell">
      <Sidebar path={path} navigate={navigate} />
      <div className="main">
        <Navbar navigate={navigate} />
        <main className="page crop-listings-page">
          <div className="page-header">
            <div>
              <h1>Crop Listings</h1>
              <p className="muted">
                {isTrader
                  ? "Trader view with inline crop listing editing."
                  : "Farmer view with read-only crop cards."}
              </p>
            </div>
            <button type="button" className="secondary" onClick={loadProducts}>
              Refresh
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <CropListingSection
            crops={products}
            role={role}
            loading={loading}
            title={title}
            description={description}
            emptyMessage="No crop listings available yet."
            onListingUpdate={isTrader ? updateCropListing : undefined}
            onListingCreate={isTrader ? createCropListing : undefined}
            savingCropId={savingCropId}
            creatingCrop={creatingCrop}
            uploadingCropId={uploadingCropId}
            onImageSelect={isTrader ? uploadCropImage : undefined}
          />
        </main>
      </div>
    </div>
  );
}
