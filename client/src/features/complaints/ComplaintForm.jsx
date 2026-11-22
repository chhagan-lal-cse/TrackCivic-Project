import { useCallback, useEffect, useState } from 'react';
import FormInput from '../../components/FormInput.jsx';
import LocationPicker from '../../components/LocationPicker.jsx';
import { CATEGORIES, MAX_IMAGE_MB, PRIORITIES } from '../../utils/constants.js';
import { formatBytes } from '../../utils/format.js';
import { validateComplaint, validateImage } from '../../utils/validation.js';

const EMPTY = { title: '', description: '', category: '', priority: 'Medium', address: '', city: '', latitude: '', longitude: '' };

/**
 * Shared create/edit form. Client-side validation mirrors the server rules;
 * server errors (422) are passed back in through `serverErrors`.
 *
 * NOTE: onLocationChange is memoized with useCallback so LocationPicker
 * (which is React.memo-wrapped) does not re-mount when other form fields change.
 * This prevents the map from refreshing on every keystroke.
 */
export default function ComplaintForm({
  initialValues, existingAttachmentUrl, submitLabel, busy, serverErrors = {}, onSubmit, onCancel,
}) {
  const [values, setValues] = useState(() => ({ ...EMPTY, ...initialValues }));
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { setErrors((e) => ({ ...e, ...serverErrors })); }, [serverErrors]);

  useEffect(() => {
    if (!image) { setPreview(null); return undefined; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0] || null;
    const err = validateImage(file);
    if (err) {
      setErrors((er) => ({ ...er, image: err }));
      setImage(null);
      e.target.value = '';
      return;
    }
    setErrors((er) => ({ ...er, image: undefined }));
    setImage(file);
    setRemoveAttachment(false);
  };

  // Stable callback — LocationPicker is memo-wrapped and will NOT re-mount
  // when this callback's closure captures updated `setValues` via functional update.
  const handleLocationChange = useCallback(({ latitude, longitude, address, city }) => {
    setValues((v) => ({
      ...v,
      latitude: latitude ?? '',
      longitude: longitude ?? '',
      // Only auto-fill address/city if the user hasn't typed anything yet
      address: v.address ? v.address : (address || v.address),
      city: v.city ? v.city : (city || v.city),
    }));
    setErrors((er) => ({ ...er, latitude: undefined, longitude: undefined }));
  }, []); // empty deps — uses functional setValues, so no stale closure

  const submit = (e) => {
    e.preventDefault();
    const found = validateComplaint(values);
    if (errors.image) found.image = errors.image;
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    onSubmit(values, image, removeAttachment);
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="border-bottom pb-3 mb-4"><h2 className="h5 mb-1">Issue information</h2><p className="small text-muted mb-0">Describe what happened clearly and classify the report.</p></div>
      <div className="row g-3">
        <FormInput className="col-12" id="title" label="Complaint title" required value={values.title} onChange={set('title')}
          error={errors.title} maxLength={120} placeholder="e.g. Streetlight out on Lane 3" hint="A short summary, 5-120 characters." />

        <FormInput className="col-12" id="description" label="Detailed description" as="textarea" rows={5} required
          value={values.description} onChange={set('description')} error={errors.description} maxLength={2000}
          hint={`What is wrong, since when, and who is affected. ${values.description.length}/2000`} />

        <FormInput className="col-md-6" id="category" label="Category" as="select" required value={values.category} onChange={set('category')} error={errors.category}>
          <option value="">Choose a category</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
        </FormInput>

        <FormInput className="col-md-6" id="priority" label="Priority" as="select" value={values.priority} onChange={set('priority')} error={errors.priority}
          hint="Choose Urgent only for safety hazards.">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </FormInput>

        <FormInput className="col-md-8" id="address" label="Address or landmark" required value={values.address} onChange={set('address')} error={errors.address} maxLength={250}
          placeholder="Street, building or nearby landmark" />

        <FormInput className="col-md-4" id="city" label="City / area" required value={values.city} onChange={set('city')} error={errors.city} maxLength={80} />

        <div className="col-12 mt-3">
          <div className="border-bottom pb-2 mb-3">
            <h2 className="h5 mb-1 text-dark">
              <i className="bi bi-geo-alt-fill text-teal me-2" />
              Location on Map & Photo
            </h2>
            <p className="small text-muted mb-0">Select the issue location directly on the interactive map below or click 'Use My Current Location'.</p>
          </div>

          <div className="mb-3">
            <LocationPicker
              latitude={values.latitude}
              longitude={values.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>

        <div className="col-12">
          <label htmlFor="image" className="form-label">Photo (optional)</label>
          <input id="image" type="file" accept="image/jpeg,image/png,image/webp" className={`form-control ${errors.image ? 'is-invalid' : ''}`} onChange={onFile}
            aria-describedby="image-hint" />
          {errors.image
            ? <div className="invalid-feedback d-block">{errors.image}</div>
            : <div id="image-hint" className="form-text">JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</div>}
          {preview && (
            <div className="mt-2 d-flex align-items-center gap-3">
              <img src={preview} alt="Selected upload preview" style={{ width: 96, height: 72, objectFit: 'cover' }} className="rounded border" />
              <div className="small">
                <div>{image.name}</div>
                <div className="text-muted">{formatBytes(image.size)}</div>
                <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => { setImage(null); document.getElementById('image').value = ''; }}>Remove</button>
              </div>
            </div>
          )}
          {!preview && existingAttachmentUrl && (
            <div className="mt-2 d-flex align-items-center gap-3">
              {!removeAttachment && <img src={existingAttachmentUrl} alt="Current attachment" style={{ width: 96, height: 72, objectFit: 'cover' }} className="rounded border" />}
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="removeAttachment" checked={removeAttachment} onChange={(e) => setRemoveAttachment(e.target.checked)} />
                <label className="form-check-label small" htmlFor="removeAttachment">Remove the current photo</label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
        {onCancel && <button type="button" className="btn btn-light" onClick={onCancel} disabled={busy}>Cancel</button>}
        <button type="submit" className="btn btn-teal px-4" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
