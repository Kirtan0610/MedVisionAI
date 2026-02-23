import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

/* ─── Overpass API: fetch nearby places with extended tags ─── */
async function fetchNearby(lat, lng, radiusM = 5000) {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="pharmacy"](around:${radiusM},${lat},${lng});
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="clinic"](around:${radiusM},${lat},${lng});
      node["amenity"="doctors"](around:${radiusM},${lat},${lng});
      node["amenity"="medical_store"](around:${radiusM},${lat},${lng});
      node["healthcare"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["amenity"="clinic"](around:${radiusM},${lat},${lng});
      way["amenity"="pharmacy"](around:${radiusM},${lat},${lng});
    );
    out center body;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await res.json();
  return data.elements
    .map((el) => {
      const t = el.tags || {};
      const addr = [
        t["addr:housenumber"],
        t["addr:street"],
        t["addr:suburb"] || t["addr:district"],
        t["addr:city"],
        t["addr:postcode"],
      ].filter(Boolean).join(", ");

      return {
        id: el.id,
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        name: t.name || t["name:en"] || t["name:hi"] || "Unnamed",
        nameHi: t["name:hi"] || "",
        type: t.amenity || t.healthcare || "clinic",
        phone: t.phone || t["contact:phone"] || t["phone:IN"] || "",
        phone2: t["phone:2"] || t["contact:mobile"] || "",
        email: t.email || t["contact:email"] || "",
        website: t.website || t["contact:website"] || t.url || "",
        opening: t.opening_hours || "",
        address: addr,
        street: t["addr:street"] || "",
        city: t["addr:city"] || "",
        postcode: t["addr:postcode"] || "",
        operator: t.operator || t.brand || "",
        specialty: t["healthcare:speciality"] || t["medical_specialty"] || t["speciality"] || "",
        beds: t.beds || t.capacity || "",
        emergency: t.emergency || "",
        wheelchair: t.wheelchair || "",
        description: t.description || t.note || "",
        wikidata: t.wikidata || "",
        wikipedia: t.wikipedia || "",
        fee: t.fee || "",
        language: t["language:en"] || "",
        level: t.level || "",
      };
    })
    .filter((p) => p.lat && p.lng);
}

/* ─── haversine distance ─── */
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const fmt = (d) =>
  d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;

/* ─── Type config ─── */
const TYPE_CFG = {
  pharmacy:      { label: "Pharmacy",      emoji: "💊", color: "#10b981", bg: "from-emerald-500/20 to-emerald-500/5", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  hospital:      { label: "Hospital",      emoji: "🏥", color: "#ef4444", bg: "from-red-500/20 to-red-500/5",      badge: "text-red-400 bg-red-500/10 border-red-500/30" },
  clinic:        { label: "Clinic",        emoji: "🩺", color: "#3b82f6", bg: "from-blue-500/20 to-blue-500/5",    badge: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  doctors:       { label: "Doctor",        emoji: "👨‍⚕️", color: "#8b5cf6", bg: "from-violet-500/20 to-violet-500/5", badge: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  medical_store: { label: "Medical Store", emoji: "🏪", color: "#f59e0b", bg: "from-amber-500/20 to-amber-500/5",  badge: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  dentist:       { label: "Dentist",       emoji: "🦷", color: "#06b6d4", bg: "from-cyan-500/20 to-cyan-500/5",    badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  physiotherapist: { label: "Physio",     emoji: "🦴", color: "#f97316", bg: "from-orange-500/20 to-orange-500/5", badge: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
};
const getTypeCfg = (t) => TYPE_CFG[t] || TYPE_CFG.clinic;

/* ─── Detail Drawer Component ─── */
function DetailDrawer({ place, userPos, dark, onClose }) {
  const cfg = getTypeCfg(place.type);
  const dist = userPos ? distKm(userPos.lat, userPos.lng, place.lat, place.lng) : null;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const osmUrl   = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=17/${place.lat}/${place.lng}`;

  const muted  = dark ? "text-slate-400" : "text-slate-500";
  const divBg  = dark ? "border-slate-700" : "border-slate-200";
  const rowCls = dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200";

  const infoRows = [
    place.phone    && { icon: "📞", label: "Phone",    val: place.phone,   href: `tel:${place.phone}` },
    place.phone2   && { icon: "📱", label: "Alt Phone", val: place.phone2,  href: `tel:${place.phone2}` },
    place.email    && { icon: "✉️", label: "Email",    val: place.email,   href: `mailto:${place.email}` },
    place.website  && { icon: "🌐", label: "Website",  val: place.website.replace(/^https?:\/\//, ""), href: place.website.startsWith("http") ? place.website : `https://${place.website}` },
    place.address  && { icon: "📍", label: "Address",  val: place.address },
    place.opening  && { icon: "🕐", label: "Hours",    val: place.opening },
    place.operator && { icon: "🏢", label: "Operator", val: place.operator },
    place.specialty && { icon: "🩻", label: "Specialty", val: place.specialty },
    place.beds     && { icon: "🛏️", label: "Beds",    val: place.beds },
    place.emergency === "yes" && { icon: "🚨", label: "Emergency", val: "Available 24/7" },
    place.wheelchair === "yes" && { icon: "♿", label: "Wheelchair", val: "Accessible" },
    place.wheelchair === "no"  && { icon: "♿", label: "Wheelchair", val: "Not accessible" },
    place.fee === "no"   && { icon: "🆓", label: "Fee",       val: "Free / Government" },
    place.fee === "yes"  && { icon: "💰", label: "Fee",       val: "Paid service" },
    place.description  && { icon: "ℹ️", label: "Note",    val: place.description },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-4 animate-fadeIn"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className={`w-full sm:w-[420px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slideInRight flex flex-col
          ${dark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Photo banner ── */}
        <div className={`relative h-44 sm:h-52 rounded-t-2xl sm:rounded-t-2xl overflow-hidden bg-gradient-to-br ${cfg.bg} flex-shrink-0`}>
          {/* Decorative background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span style={{ fontSize: "10rem", lineHeight: 1 }}>{cfg.emoji}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white text-sm hover:bg-black/60 transition-all">
            ✕
          </button>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cfg.badge}`}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="font-bold text-white text-lg leading-snug" style={{ fontFamily: "'Sora',sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
              {place.name}
            </h2>
            {place.nameHi && <p className="text-white/70 text-sm">{place.nameHi}</p>}
            {dist !== null && (
              <p className="text-white/80 text-xs mt-0.5 font-semibold">
                📍 {fmt(dist)} away
              </p>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className={`grid grid-cols-2 gap-2 p-3 border-b ${divBg} flex-shrink-0`}>
          <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            🗺️ Get Directions
          </a>
          {place.phone ? (
            <a href={`tel:${place.phone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200">
              📞 Call Now
            </a>
          ) : (
            <a href={osmUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
                ${dark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
              🌍 View on Map
            </a>
          )}
        </div>

        {/* ── Location map mini hint ── */}
        <div className={`mx-3 mt-3 rounded-xl border flex items-center gap-2.5 p-3 text-xs ${rowCls}`}>
          <span className="text-2xl shrink-0">📡</span>
          <div>
            <p className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>GPS Coordinates</p>
            <p className={`font-mono ${muted}`}>{place.lat.toFixed(5)}, {place.lng.toFixed(5)}</p>
          </div>
          <a href={osmUrl} target="_blank" rel="noopener noreferrer"
            className="ml-auto text-blue-500 hover:text-blue-400 font-semibold text-[0.65rem] whitespace-nowrap">
            OSM ↗
          </a>
        </div>

        {/* ── Info rows ── */}
        <div className="p-3 space-y-2 flex-1">
          {infoRows.length > 0 ? (
            infoRows.map((row, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${rowCls} animate-fadeInUp`}
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-lg shrink-0 mt-0.5">{row.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[0.6rem] font-bold uppercase tracking-wider mb-0.5 ${muted}`}>{row.label}</p>
                  {row.href ? (
                    <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-sm font-medium break-all transition-colors">
                      {row.val}
                    </a>
                  ) : (
                    <p className={`text-sm leading-snug ${dark ? "text-slate-200" : "text-slate-800"}`}>{row.val}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">ℹ️</p>
              <p className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>Limited info available</p>
              <p className={`text-xs mt-1 ${muted}`}>Tap "Get Directions" to view on Google Maps</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={`p-3 border-t ${divBg} flex-shrink-0`}>
          <p className={`text-[0.6rem] text-center ${muted}`}>
            Data from <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenStreetMap</a> · May not always be up-to-date
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Place Card ─── */
function PlaceCard({ place, userPos, dark, isSelected, onClick, delay }) {
  const cfg  = getTypeCfg(place.type);
  const dist = userPos ? distKm(userPos.lat, userPos.lng, place.lat, place.lng) : null;
  const muted = dark ? "text-slate-400" : "text-slate-500";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 hover:-translate-y-0.5 animate-fadeInUp overflow-hidden
        ${isSelected
          ? `border-blue-500 ring-2 ring-blue-500/20 ${dark ? "bg-blue-600/8" : "bg-blue-50"}`
          : dark ? "bg-slate-900 border-slate-800 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Colored top strip */}
      <div className="h-1 w-full" style={{ background: cfg.color }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0
            ${dark ? "bg-slate-800" : "bg-slate-50"}`}
            style={{ border: `2px solid ${cfg.color}40` }}>
            {cfg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-snug ${dark ? "text-slate-100" : "text-slate-800"}`}>
              {place.name}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`text-[0.58rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                {cfg.label}
              </span>
              {place.emergency === "yes" && (
                <span className="text-[0.58rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border text-red-400 bg-red-500/10 border-red-500/25">
                  🚨 Emergency
                </span>
              )}
              {place.wheelchair === "yes" && (
                <span className="text-[0.58rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/25">
                  ♿ Accessible
                </span>
              )}
            </div>
          </div>
          {/* Distance */}
          {dist !== null && (
            <div className="shrink-0 text-right">
              <p className="font-bold text-base" style={{ color: cfg.color, fontFamily: "'Sora',sans-serif" }}>
                {fmt(dist)}
              </p>
              <p className={`text-[0.6rem] ${muted}`}>away</p>
            </div>
          )}
        </div>

        {/* Info pills row */}
        <div className="flex flex-wrap gap-1.5">
          {place.phone && (
            <span className={`flex items-center gap-1 text-[0.65rem] px-2 py-1 rounded-lg border font-medium
              ${dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              📞 {place.phone.length > 14 ? place.phone.slice(0, 14) + "…" : place.phone}
            </span>
          )}
          {place.address && (
            <span className={`flex items-center gap-1 text-[0.65rem] px-2 py-1 rounded-lg border font-medium truncate max-w-[180px]
              ${dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              📍 {place.address.split(",")[0]}
            </span>
          )}
          {place.opening && (
            <span className={`flex items-center gap-1 text-[0.65rem] px-2 py-1 rounded-lg border font-medium
              ${dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              🕐 {place.opening.length > 20 ? place.opening.slice(0, 20) + "…" : place.opening}
            </span>
          )}
          {place.specialty && (
            <span className={`flex items-center gap-1 text-[0.65rem] px-2 py-1 rounded-lg border font-medium
              ${dark ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
              🩻 {place.specialty}
            </span>
          )}
          {place.website && (
            <span className={`flex items-center gap-1 text-[0.65rem] px-2 py-1 rounded-lg border font-medium
              ${dark ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
              🌐 Website
            </span>
          )}
        </div>

        {/* Tap hint */}
        <p className={`text-[0.6rem] mt-2.5 font-medium ${muted}`}>
          Tap to see full details →
        </p>
      </div>
    </button>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function NearbyPage() {
  const { dark } = useTheme();
  const mapRef         = useRef(null);
  const leafletMapRef  = useRef(null);
  const markersRef     = useRef([]);

  const [status, setStatus]     = useState("idle");
  const [error, setError]       = useState("");
  const [places, setPlaces]     = useState([]);
  const [userPos, setUserPos]   = useState(null);
  const [filter, setFilter]     = useState("all");
  const [radius, setRadius]     = useState(5000);
  const [selected, setSelected] = useState(null);

  /* ── Load Leaflet CSS ── */
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  /* ── Filtered + sorted list ── */
  const visible = places
    .filter((p) => {
      if (filter === "pharmacy") return ["pharmacy", "medical_store"].includes(p.type);
      if (filter === "hospital") return ["hospital", "clinic", "doctors", "dentist", "physiotherapist"].includes(p.type);
      return true;
    })
    .map((p) => ({ ...p, dist: userPos ? distKm(userPos.lat, userPos.lng, p.lat, p.lng) : 0 }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 40);

  /* ── Init / refresh map ── */
  useEffect(() => {
    if (!userPos || !mapRef.current) return;
    let Lref;

    import("leaflet").then((L) => {
      Lref = L.default || L;

      if (!leafletMapRef.current) {
        leafletMapRef.current = Lref.map(mapRef.current, {
          center: [userPos.lat, userPos.lng],
          zoom: 14,
          zoomControl: true,
        });
        Lref.tileLayer(
          dark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
        ).addTo(leafletMapRef.current);
      } else {
        leafletMapRef.current.setView([userPos.lat, userPos.lng]);
      }

      /* Clear old markers */
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      /* User pin */
      const userIcon = Lref.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.35)"></div>`,
        iconSize: [18, 18], iconAnchor: [9, 9],
      });
      markersRef.current.push(
        Lref.marker([userPos.lat, userPos.lng], { icon: userIcon })
          .addTo(leafletMapRef.current)
          .bindPopup("<b>📍 You are here</b>")
      );

      /* Place pins */
      visible.forEach((p) => {
        const cfg  = getTypeCfg(p.type);
        const dist = distKm(userPos.lat, userPos.lng, p.lat, p.lng);
        const icon = Lref.divIcon({
          className: "",
          html: `<div style="width:34px;height:34px;border-radius:50%;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:17px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);cursor:pointer">${cfg.emoji}</div>`,
          iconSize: [34, 34], iconAnchor: [17, 17],
        });
        const popupContent = `
          <div style="min-width:180px;font-family:'Inter',sans-serif;padding:2px">
            <b style="font-size:13px">${cfg.emoji} ${p.name}</b><br>
            <span style="color:#6b7280;font-size:11px">${cfg.label}</span><br>
            <span style="color:${cfg.color};font-size:12px;font-weight:700">${fmt(dist)} away</span>
            ${p.phone ? `<br><span style="font-size:11px">📞 ${p.phone}</span>` : ""}
            ${p.address ? `<br><span style="color:#6b7280;font-size:11px">📍 ${p.address.split(",").slice(0,2).join(",")}</span>` : ""}
            ${p.opening ? `<br><span style="font-size:11px">🕐 ${p.opening.slice(0,30)}</span>` : ""}
            <br><a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" 
              target="_blank" style="color:#3b82f6;font-size:11px;font-weight:600">🗺️ Get Directions ↗</a>
          </div>`;
        markersRef.current.push(
          Lref.marker([p.lat, p.lng], { icon })
            .addTo(leafletMapRef.current)
            .bindPopup(popupContent)
        );
      });
    });
  }, [userPos, visible.length, filter]); // eslint-disable-line

  /* ── Locate ── */
  const locate = () => {
    setStatus("loading"); setError(""); setPlaces([]); setSelected(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser."); setStatus("error"); return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setUserPos({ lat, lng });
        try {
          const data = await fetchNearby(lat, lng, radius);
          setPlaces(data); setStatus("success");
        } catch {
          setError("Failed to fetch nearby places. Please try again."); setStatus("error");
        }
      },
      (err) => {
        setError(err.code === 1
          ? "Location permission denied. Please allow location access and try again."
          : "Unable to determine your location. Please try again.");
        setStatus("error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  /* Pan map to selected place */
  const selectPlace = (place) => {
    setSelected(place);
    if (leafletMapRef.current)
      leafletMapRef.current.setView([place.lat, place.lng], 16, { animate: true });
  };

  const pharmCount = places.filter((p) => ["pharmacy","medical_store"].includes(p.type)).length;
  const hospCount  = places.filter((p) => ["hospital","clinic","doctors","dentist","physiotherapist"].includes(p.type)).length;

  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const inp   = dark ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" : "bg-white border-slate-300 text-slate-900 focus:border-blue-500";

  const FILTERS = [
    { key: "all",      label: "All", emoji: "🗺️" },
    { key: "pharmacy", label: "Pharmacies", emoji: "💊" },
    { key: "hospital", label: "Hospitals & Clinics", emoji: "🏥" },
  ];

  return (
    <div className="max-w-6xl mx-auto" style={{ fontFamily: "'Inter',sans-serif" }}>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer
          place={selected}
          userPos={userPos}
          dark={dark}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-5 animate-fadeInDown">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-0.5">Location Services</p>
        <h1 className={`font-bold text-2xl ${dark ? "text-slate-100" : "text-slate-900"}`} style={{ fontFamily: "'Sora',sans-serif" }}>
          Nearby Medical Places
        </h1>
        <p className={`text-sm mt-1 ${muted}`}>Find pharmacies, hospitals &amp; clinics near you — with full details</p>
      </div>

      {/* ── Controls ── */}
      <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border mb-4 animate-fadeInUp ${card}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${muted}`}>Radius:</span>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold outline-none transition-all ${inp}`}>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={15000}>15 km</option>
          </select>
        </div>
        <button onClick={locate} disabled={status === "loading"}
          className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
          {status === "loading"
            ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner shrink-0" />Locating…</>
            : <>📍 {status === "success" ? "Re-locate" : "Find Near Me"}</>}
        </button>
        {status === "success" && (
          <div className="flex items-center gap-3 ml-auto animate-fadeIn">
            <span className={`text-xs ${muted}`}>💊 <b className="text-emerald-400">{pharmCount}</b> pharmacies</span>
            <span className={`text-xs ${muted}`}>🏥 <b className="text-red-400">{hospCount}</b> hospitals/clinics</span>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {status === "error" && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 text-sm animate-slideInLeft
          ${dark ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-0.5">Location Error</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Idle ── */}
      {status === "idle" && (
        <div className={`flex flex-col items-center justify-center py-20 rounded-xl border text-center animate-fadeInUp ${card}`}>
          <div className="text-6xl mb-4 animate-float">🗺️</div>
          <h2 className={`font-bold text-lg mb-2 ${dark ? "text-slate-100" : "text-slate-800"}`} style={{ fontFamily: "'Sora',sans-serif" }}>
            Discover Nearby Medical Places
          </h2>
          <p className={`text-sm max-w-xs mb-6 leading-relaxed ${muted}`}>
            Get phone numbers, addresses, hours, directions & more for hospitals and pharmacies near you.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["💊 Pharmacies", "🏥 Hospitals", "🩺 Clinics", "👨‍⚕️ Doctors", "🦷 Dentists", "🏪 Medical Stores"].map((t) => (
              <span key={t} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border
                ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>{t}</span>
            ))}
          </div>
          <button onClick={locate}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            📍 Allow Location &amp; Search
          </button>
          <p className={`text-xs mt-4 ${muted}`}>🔒 Your location is never stored or shared</p>
        </div>
      )}

      {/* ── Loading ── */}
      {status === "loading" && (
        <div className="space-y-3 animate-fadeIn">
          <div className="skeleton h-72 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {status === "success" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Map */}
          <div className={`rounded-xl border overflow-hidden shadow-sm ${card}`}>
            <div ref={mapRef} style={{ height: "360px", width: "100%", zIndex: 1 }} />
          </div>

          {/* Filters */}
          <div className={`p-1 rounded-xl border animate-fadeInUp ${dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap
                    ${filter === f.key
                      ? "bg-blue-600 text-white"
                      : dark ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}>
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty */}
          {visible.length === 0 && (
            <div className={`text-center py-12 rounded-xl border ${card}`}>
              <p className="text-3xl mb-2">🔍</p>
              <p className={`font-semibold text-sm mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                No places found for this filter
              </p>
              <p className={`text-xs ${muted}`}>Try increasing the search radius or change filter</p>
            </div>
          )}

          {/* Cards */}
          {visible.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visible.map((p, i) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  userPos={userPos}
                  dark={dark}
                  isSelected={selected?.id === p.id}
                  onClick={() => selectPlace(p)}
                  delay={i * 35}
                />
              ))}
            </div>
          )}

          {/* Privacy */}
          <div className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs animate-fadeInUp
            ${dark ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400/70" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            <span className="shrink-0">🔒</span>
            <span>Your location is used only to search nearby places. It is <strong>never stored</strong> on our servers.</span>
          </div>

          <p className={`text-center text-[0.65rem] ${muted}`}>
            Map &amp; place data © <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenStreetMap</a> contributors · Overpass API
          </p>
        </div>
      )}
    </div>
  );
}
