import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  PlusCircle, MapPin, Trash2, AlertCircle, Upload,
  Compass, Check, Loader2, HelpCircle, X
} from 'lucide-react';

const CATEGORIES = ['Roads', 'Water', 'Sanitation', 'Electricity', 'Health', 'Education'];

const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all";
const errorInputClass = "border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/10 focus:border-red-400";

function SectionCard({ step, title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center text-xs font-bold font-mono">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? (
    <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {msg}
    </p>
  ) : null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [form, setForm]           = useState({ description: '', department: '', location: '', photoUrl: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');

  const [detectingLoc, setDetectingLoc] = useState(false);
  const [locSuccess, setLocSuccess]     = useState(false);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview]     = useState(null);
  const [fileName, setFileName]           = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by your browser.', 'error');
      return;
    }
    setDetectingLoc(true);
    setLocSuccess(false);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setForm(f => ({ ...f, location: data?.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
          setLocSuccess(true);
          showToast('Location resolved successfully.', 'success');
        } catch {
          setForm(f => ({ ...f, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
          setLocSuccess(true);
          showToast('Coordinates captured (reverse lookup unavailable).', 'warning');
        } finally {
          setDetectingLoc(false);
        }
      },
      () => {
        setDetectingLoc(false);
        showToast('Unable to retrieve location. Please type it manually.', 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const simulateUpload = file => {
    setUploadingFile(true);
    setFileName(file.name);
    setFilePreview(URL.createObjectURL(file));
    setTimeout(() => {
      setUploadingFile(false);
      const mockUrl = `https://res.cloudinary.com/whistleblower/image/upload/mock_${Date.now()}_${encodeURIComponent(file.name)}`;
      setForm(f => ({ ...f, photoUrl: mockUrl }));
      showToast('Evidence image attached successfully.', 'success');
    }, 1800);
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file);
  };

  const handleDragOver  = e => e.preventDefault();
  const handleDrop      = e => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) simulateUpload(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.department)              errs.department  = 'Please select a category.';
    if (!form.location.trim())         errs.location    = 'Please provide the incident location.';
    if (!form.description.trim())      errs.description = 'Please describe the incident.';
    else if (form.description.trim().length < 15)
                                        errs.description = 'Description must be at least 15 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    if (!validate()) { showToast('Please fix the highlighted fields.', 'warning'); return; }

    setLoading(true);
    try {
      const payload = {
        description: form.description.trim(),
        department:  form.department,
        location:    form.location.trim(),
        ...(form.photoUrl.trim() && { photoUrl: form.photoUrl.trim() }),
      };
      const res = await api.post('/issues/create', payload);
      if (res.data.success) {
        showToast('Complaint successfully registered.', 'success');
        navigate('/report/complete', { state: { token: res.data.data.token } });
      }
    } catch (err) {
      if (err.response) {
        const s = err.response.status;
        if (s === 401) { logout(); navigate('/login?redirect=/report'); }
        else {
          const msg = err.response.data?.error || 'Failed to submit. Please try again.';
          setServerError(msg);
          showToast(msg, 'error');
        }
      } else {
        setServerError('No server connection. Check your network.');
        showToast('Could not reach server.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
          Submit a Complaint
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Investigators are assigned automatically based on selected category.
          All submissions are encrypted in transit.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Section 1 — Category & Description */}
        <SectionCard step="1" title="Complaint Details">
          <div>
            <label htmlFor="department" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Incident Category <span className="text-sky-500">*</span>
            </label>
            <select
              id="department" name="department"
              value={form.department} onChange={handleChange}
              className={`${inputClass} ${errors.department ? errorInputClass : ''}`}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError msg={errors.department} />
            {!errors.department && (
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1.5">
                Reports are routed to investigators of the selected sector.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-sky-500">*</span>
            </label>
            <textarea
              id="description" name="description" rows={5}
              value={form.description} onChange={handleChange}
              placeholder="Describe the incident in detail. Include specifics such as severity, duration, hazard type, and any context that assists investigators."
              className={`${inputClass} resize-none ${errors.description ? errorInputClass : ''}`}
            />
            <FieldError msg={errors.description} />
            {!errors.description && (
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1.5">
                Detailed descriptions accelerate investigator response times.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Section 2 — Location */}
        <SectionCard step="2" title="Incident Location">
          <div>
            <label htmlFor="location" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Location Address <span className="text-sky-500">*</span>
            </label>
            <div className="relative">
              <input
                id="location" name="location" type="text"
                value={form.location} onChange={handleChange}
                placeholder="Street, area, landmark, or GPS coordinates"
                className={`${inputClass} pr-12 ${errors.location ? errorInputClass : ''}`}
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLoc}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-500 hover:border-sky-500/40 disabled:opacity-50 transition-all"
                title="Auto-detect GPS location"
              >
                {detectingLoc ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                ) : locSuccess ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
              </button>
            </div>
            <FieldError msg={errors.location} />
            {!errors.location && (
              <div className="flex justify-between items-center mt-1.5">
                <p className="text-[11px] text-slate-400 dark:text-slate-600">
                  Enables dispatch of investigators to the precise location.
                </p>
                <button
                  type="button" onClick={handleDetectLocation}
                  className="text-[11px] text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Auto-detect
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 3 — Evidence Upload */}
        <SectionCard step="3" title={<span>Supporting Evidence <span className="text-slate-400 font-normal text-xs ml-1">Optional</span></span>}>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500/50 dark:hover:border-sky-500/40 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <input
              id="photoInput" type="file" accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {uploadingFile ? (
              <div className="flex flex-col items-center py-3 gap-2">
                <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Uploading evidence...</p>
                <div className="w-40 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full shimmer w-2/3" />
                </div>
              </div>
            ) : filePreview ? (
              <div className="flex flex-col items-center py-1 gap-2">
                <img src={filePreview} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-xs">{fileName}</p>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFilePreview(null); setFileName(''); setForm(f => ({ ...f, photoUrl: '' })); }}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2 gap-2 text-slate-400 dark:text-slate-600">
                <Upload className="w-7 h-7" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drag & drop or click to upload</p>
                <p className="text-xs">JPG, PNG accepted</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-800/30 rounded-lg">
            <HelpCircle className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Why attach evidence?</span>{' '}
              Photo evidence enables investigators to verify coordinates, assess hazard severity, and
              allocate appropriate response resources before arriving on-site.
            </p>
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-sm"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><PlusCircle className="w-4 h-4" /> Submit Complaint</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
