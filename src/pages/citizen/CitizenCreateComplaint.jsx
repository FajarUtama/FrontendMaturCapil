import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { ClipboardList, MapPin, Upload, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const CitizenCreateComplaint = () => {
  const { currentUser, categories, createComplaint } = useMockData();
  const navigate = useNavigate();

  // Guard: Redirect to login if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/maturcapil/login?redirect=/maturcapil/create');
    }
  }, [currentUser, navigate]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Sedang');
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState([]); // Base64 data urls
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  
  // Custom Map Coordinate Selection States
  const [latitude, setLatitude] = useState(-6.9822);
  const [longitude, setLongitude] = useState(110.4091);
  const [selectedDistrict, setSelectedDistrict] = useState('Semarang Tengah');

  // Districts in Semarang for simulated pin
  const SEMARANG_DISTRICTS = [
    { name: 'Semarang Tengah', lat: -6.9822, lng: 110.4091 },
    { name: 'Semarang Barat', lat: -6.9794, lng: 110.3842 },
    { name: 'Semarang Timur', lat: -6.9818, lng: 110.4358 },
    { name: 'Semarang Selatan', lat: -6.9994, lng: 110.4183 },
    { name: 'Semarang Utara', lat: -6.9536, lng: 110.4158 },
    { name: 'Pedurungan', lat: -7.0041, lng: 110.4578 },
    { name: 'Tembalang', lat: -7.0514, lng: 110.4428 },
    { name: 'Banyumanik', lat: -7.0653, lng: 110.4142 },
    { name: 'Gunungpati', lat: -7.0608, lng: 110.3664 },
    { name: 'Ngaliyan', lat: -6.9986, lng: 110.3475 }
  ];

  if (!currentUser) return null;

  // Handle Image upload with base64 conversion & validation (max 5MB)
  const handlePhotoUpload = (e) => {
    setPhotoError('');
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 3) {
      setPhotoError('Maksimal upload 3 foto bukti.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Ukuran file melebihi 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Simulating picking map coordinates on a vector grid
  const handleMapClick = (district) => {
    setLatitude(district.lat);
    setLongitude(district.lng);
    setSelectedDistrict(district.name);
    setAddress(prev => {
      if (!prev || prev.includes('Kec.')) {
        return `Kec. ${district.name}, Kota Semarang`;
      }
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !categoryId || !address) {
      setFormError('Harap lengkapi semua kolom wajib (*)');
      return;
    }

    const result = createComplaint({
      title,
      description,
      categoryId,
      priority,
      latitude,
      longitude,
      address,
      photos
    });

    if (result.success) {
      // Redirect to complaint history page after creation
      navigate('/maturcapil/history');
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-5 animate-slide-up">
      
      {/* Page Title */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <ClipboardList className="w-5 h-5 text-brand-500" />
        <div>
          <h2 className="font-extrabold text-base text-slate-800">Buat Pengaduan</h2>
          <p className="text-[10px] text-slate-400 font-medium">Ajukan keluhan Anda mengenai pelayanan adminduk</p>
        </div>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-slide-down">
          <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
          <p className="font-semibold">{formError}</p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Judul Pengaduan *</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. KK Salah Ketik Nama, KTP-el Belum Dicetak" 
            className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all shadow-xs"
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kategori *</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all shadow-xs"
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prioritas *</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all shadow-xs"
            >
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deskripsi Lengkap Kejadian *</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara rinci mengenai keluhan Anda: lokasi pastinya, nama petugas jika ada, kronologi, dan nomor berkas pendaftaran jika relevan."
            rows={4}
            className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all shadow-xs leading-relaxed"
          />
        </div>

        {/* Map Location Picker */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lokasi Kejadian *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap atau detail lokasi" 
              className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all shadow-xs"
            />
          </div>

          {/* Interactive Map Visual Simulator */}
          <div className="mt-2 border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
              <span>Peta Koordinat (Kota Semarang)</span>
              <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Kec. {selectedDistrict}</span>
            </div>
            
            {/* Visual Vector Grid of Semarang Districts */}
            <div className="relative h-44 bg-blue-50/45 rounded-lg border border-slate-150 overflow-hidden flex flex-wrap gap-1 p-2 items-center justify-center">
              {/* Grid Background Mock */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0 pointer-events-none opacity-20">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-slate-300" />
                ))}
              </div>

              {/* District Buttons (Mocking Map Markers) */}
              {SEMARANG_DISTRICTS.map((dist, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMapClick(dist)}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                    selectedDistrict === dist.name 
                      ? 'bg-brand-500 border-brand-600 text-white shadow-md shadow-brand-500/20 scale-105 z-10' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-102'
                  }`}
                >
                  📍 {dist.name}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold px-1">
              <span>Latitude: {latitude.toFixed(4)}</span>
              <span>Longitude: {longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Foto Bukti Pendukung (Maks 3 Foto, @5MB)</label>
          
          {photoError && (
            <span className="text-[10px] text-rose-600 font-bold">{photoError}</span>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Image Preview Box */}
            {photos.map((photo, index) => (
              <div key={index} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {photos.length < 3 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-350 hover:border-brand-500 bg-slate-50 hover:bg-white flex flex-col justify-center items-center gap-1 cursor-pointer transition-all">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-semibold">Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handlePhotoUpload}
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <button 
          type="submit"
          className="mt-4 w-full bg-brand-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 active:scale-98 transition-all shadow-md shadow-brand-500/10 cursor-pointer"
        >
          Kirim Laporan Pengaduan
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
