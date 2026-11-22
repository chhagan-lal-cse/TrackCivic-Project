import { memo, useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG Pin Icon that requires no external asset files
const createPinIcon = (color = '#0d9488') => L.divIcon({
  className: 'tc-leaflet-pin',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: ${color};
      color: #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.45);
      border: 3px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <span style="transform: rotate(45deg); font-size: 16px; font-weight: bold; line-height: 1;">📍</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

/**
 * LocationPicker — memo-wrapped so parent re-renders (e.g. form field changes)
 * do NOT destroy and re-create the Leaflet map.
 *
 * The map is fully self-contained after mount. `latitude`/`longitude` props are
 * only used as the INITIAL marker position (read once on mount). All subsequent
 * interactions (click, drag, GPS, search) update the map internally and call
 * `onLocationChange` to notify the parent — but incoming prop changes do NOT
 * re-trigger the map, preventing the refresh-on-state-update loop.
 */
const LocationPicker = memo(function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  readOnly = false,
  height = '320px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  // Track last coords set FROM the map so we don't re-process our own callbacks
  const internalCoordsRef = useRef({ lat: null, lng: null });

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [infoMsg, setInfoMsg] = useState('');
  // Local display state for the footer badge (avoids depending on external props)
  const [displayCoords, setDisplayCoords] = useState(() => {
    const hasCoords = latitude !== '' && longitude !== '' &&
      Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
    return hasCoords ? { lat: Number(latitude), lng: Number(longitude) } : null;
  });

  // ─── Reverse geocode helper ───────────────────────────────────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } },
      );
      if (!res.ok) return { address: '', city: '' };
      const data = await res.json();
      if (!data?.address) return { address: '', city: '' };
      const a = data.address;
      const city = a.city || a.town || a.district || a.state_district || a.county || '';
      const address = [a.road || a.suburb || a.neighbourhood, a.residential || a.amenity, city]
        .filter(Boolean).join(', ');
      setInfoMsg(`Pinned: ${data.display_name.split(',').slice(0, 3).join(',')}`);
      return { address, city };
    } catch {
      return { address: '', city: '' };
    }
  }, []);

  // ─── Place / move marker and notify parent ────────────────────────────────
  const handlePinPlaced = useCallback(async (lat, lng, moveMarker = true) => {
    const fixedLat = Number(lat.toFixed(6));
    const fixedLng = Number(lng.toFixed(6));

    // Remember these coords so the external-prop effect won't loop
    internalCoordsRef.current = { lat: fixedLat, lng: fixedLng };

    const map = mapInstanceRef.current;
    if (map) {
      if (markerRef.current) {
        if (moveMarker) markerRef.current.setLatLng([fixedLat, fixedLng]);
      } else {
        const marker = L.marker([fixedLat, fixedLng], {
          icon: createPinIcon(),
          draggable: !readOnly,
        }).addTo(map);
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          handlePinPlaced(pos.lat, pos.lng, false);
        });
        markerRef.current = marker;
      }
    }

    setInfoMsg(`Location pinned at ${fixedLat}, ${fixedLng}`);
    setDisplayCoords({ lat: fixedLat, lng: fixedLng });

    const { address, city } = await reverseGeocode(fixedLat, fixedLng);

    if (onLocationChange) {
      onLocationChange({
        latitude: String(fixedLat),
        longitude: String(fixedLng),
        address,
        city,
      });
    }
  }, [readOnly, onLocationChange, reverseGeocode]);

  // ─── Initialize Leaflet Map (runs ONCE on mount) ─────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const hasInitialCoords = latitude !== '' && longitude !== '' &&
      Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
    const initLat = hasInitialCoords ? Number(latitude) : 26.9124;
    const initLng = hasInitialCoords ? Number(longitude) : 75.7873;
    const initZoom = hasInitialCoords ? 15 : 11;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: initZoom,
      zoomControl: true,
      scrollWheelZoom: !readOnly,
      dragging: !readOnly,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (hasInitialCoords) {
      const marker = L.marker([initLat, initLng], {
        icon: createPinIcon(),
        draggable: !readOnly,
      }).addTo(map);
      if (!readOnly) {
        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          handlePinPlaced(lat, lng, false);
        });
      }
      markerRef.current = marker;
      internalCoordsRef.current = { lat: initLat, lng: initLng };
    }

    if (!readOnly) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handlePinPlaced(lat, lng, true);
      });
    }

    mapInstanceRef.current = map;

    setTimeout(() => { map.invalidateSize(); }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — map is initialized ONCE

  // ─── GPS current location ─────────────────────────────────────────────────
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setInfoMsg('Your browser does not support GPS location.');
      return;
    }
    setLocating(true);
    setInfoMsg('Detecting your GPS location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocating(false);
        const map = mapInstanceRef.current;
        if (map) map.flyTo([lat, lng], 16, { duration: 1.2 });
        handlePinPlaced(lat, lng, true);
      },
      (err) => {
        setLocating(false);
        setInfoMsg(err.code === 1 ? 'Location permission was denied by browser.' : 'Unable to acquire GPS location.');
      },
      { timeout: 12000, enableHighAccuracy: true },
    );
  }, [handlePinPlaced]);

  // ─── Search ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchResults([]);
    setInfoMsg('Searching places…');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          if (data.length === 1) {
            selectSearchResult(data[0]);
          } else {
            setSearchResults(data);
            selectSearchResult(data[0]);
          }
        } else {
          setInfoMsg('No matching location found. Try a major landmark or city.');
        }
      }
    } catch {
      setInfoMsg('Search error. Click on the map to drop a pin instead.');
    } finally {
      setSearching(false);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectSearchResult = useCallback((item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchResults([]);
    setSearchQuery(item.display_name.split(',')[0]);
    const map = mapInstanceRef.current;
    if (map) map.flyTo([lat, lng], 15, { duration: 1.2 });
    handlePinPlaced(lat, lng, true);
  }, [handlePinPlaced]);

  const clearPin = useCallback(() => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    internalCoordsRef.current = { lat: null, lng: null };
    setInfoMsg('');
    setDisplayCoords(null);
    if (onLocationChange) onLocationChange({ latitude: '', longitude: '' });
  }, [onLocationChange]);

  const hasCoords = displayCoords !== null;

  return (
    <div className="tc-location-picker">
      {!readOnly && (
        <div className="mb-2">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            <label className="form-label fw-bold mb-0 text-dark">
              <i className="bi bi-geo-alt-fill text-teal me-1" />
              Pick Exact Location on Map
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-teal d-inline-flex align-items-center shadow-sm"
                onClick={handleUseCurrentLocation}
                disabled={locating}
              >
                {locating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Finding GPS…
                  </>
                ) : (
                  <>
                    <i className="bi bi-crosshair me-1" />
                    Use My Current Location
                  </>
                )}
              </button>
              {hasCoords && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearPin}
                  title="Remove location pin"
                >
                  <i className="bi bi-x-circle me-1" />
                  Clear Pin
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="input-group mb-2 shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search area, colony or landmark (e.g. Civil Lines, Main Market)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-outline-teal"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? 'Searching…' : 'Locate on Map'}
            </button>
          </form>

          {searchResults.length > 1 && (
            <div className="list-group mb-2 shadow-sm small">
              {searchResults.slice(0, 4).map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  className="list-group-item list-group-item-action text-start py-2"
                  onClick={() => selectSearchResult(r)}
                >
                  <i className="bi bi-pin-map-fill text-teal me-2" />
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          height,
          width: '100%',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          zIndex: 1,
        }}
      />

      {/* Footer Info Pill */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mt-2 pt-1 small text-muted">
        <div>
          {hasCoords ? (
            <span className="badge bg-teal-subtle text-teal-emphasis border border-teal-subtle px-2 py-1">
              <i className="bi bi-check2-circle me-1" />
              Pin Placed: {displayCoords.lat.toFixed(4)}°, {displayCoords.lng.toFixed(4)}°
            </span>
          ) : (
            <span className="text-secondary">
              <i className="bi bi-hand-index-thumb me-1" />
              {readOnly ? 'No GPS coordinates attached' : 'Click on the map or use the button above to set the location pin.'}
            </span>
          )}
          {infoMsg && <span className="ms-2 text-dark fw-medium">({infoMsg})</span>}
        </div>
      </div>
    </div>
  );
});

export default LocationPicker;
