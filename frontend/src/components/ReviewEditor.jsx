import React, { useState, useEffect } from 'react';
import { Check, Save, ArrowLeft, Image as ImageIcon, FileText, CheckCircle2, ChevronRight, Tag } from 'lucide-react';

export default function ReviewEditor({
  docId,
  onBack,
  onDocApproved
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docData, setDocData] = useState(null);
  const [fields, setFields] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImageCategory, setActiveImageCategory] = useState('ALL');

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    fetch(`/api/review/${docId}`)
      .then(res => res.json())
      .then(data => {
        setDocData(data);
        setFields(data.fields || {});
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(err => {
        alert("Error loading document: " + err.message);
        setLoading(false);
      });
  }, [docId]);

  const handleAcademicChange = (group, key, val) => {
    setFields(prev => ({
      ...prev,
      academic_mapping: {
        ...prev.academic_mapping,
        [group]: {
          ...prev.academic_mapping?.[group],
          [key]: val
        }
      }
    }));
  };

  const handleGeneralChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      general_information: {
        ...prev.general_information,
        [key]: val
      }
    }));
  };

  const handleSpeakerChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      speaker_details: {
        ...prev.speaker_details,
        [key]: val
      }
    }));
  };

  const handleParticipantChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      participant_profile: {
        ...prev.participant_profile,
        [key]: val
      }
    }));
  };

  const handleRapporteurChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      rapporteur_details: {
        ...prev.rapporteur_details,
        [key]: val
      }
    }));
  };

  const handleFieldChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleCategoryChange = (imgId, newCategory) => {
    setImages(prev => prev.map(img => img.id === imgId ? { ...img, category: newCategory } : img));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/review/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, images })
      });
      if (res.ok) {
        alert("Draft saved successfully!");
      }
    } catch (e) {
      alert("Failed to save draft: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      // First save draft
      await fetch(`/api/review/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, images })
      });
      // Then approve
      const res = await fetch(`/api/review/${docId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        onDocApproved(docId);
      }
    } catch (e) {
      alert("Failed to approve document: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading document data...</p>
      </div>
    );
  }

  const isApproved = docData?.status === 'approved';
  const filteredImages = activeImageCategory === 'ALL'
    ? images
    : images.filter(img => img.category === activeImageCategory);

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-md">
                {docData?.filename}
              </span>
              {isApproved ? (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-200">
                  Ready for Review
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Formatted according to the 28-column standard template (to_follow.xlsx)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={saving}
            onClick={handleSaveDraft}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            disabled={saving || isApproved}
            onClick={handleApprove}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-md text-xs font-medium shadow-xs transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isApproved ? "Approved" : "Approve Record"}</span>
          </button>
        </div>
      </div>

      {/* Main split view: Fields Editor on left & center, Image Organizer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Fields form (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Section: Academic Mapping (NAAC / Strategic Plan / Graduate Attribute) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>1. Criteria & Academic Mapping</span>
            </h4>
            
            {/* NAAC */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">NAAC Mapping</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Criteria / Focus Area No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.naac?.criteria || ""}
                    onChange={(e) => handleAcademicChange("naac", "criteria", e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub Criteria No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.naac?.sub_criteria_no || ""}
                    onChange={(e) => handleAcademicChange("naac", "sub_criteria_no", e.target.value)}
                    placeholder="e.g. 5.1.3"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub-Criteria Title</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.naac?.sub_criteria_title || ""}
                    onChange={(e) => handleAcademicChange("naac", "sub_criteria_title", e.target.value)}
                    placeholder="e.g. Awareness Program"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Strategic Plan */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Strategic Plan</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Criteria / Focus Area No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.strategic_plan?.criteria || ""}
                    onChange={(e) => handleAcademicChange("strategic_plan", "criteria", e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub Criteria No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.strategic_plan?.sub_criteria_no || ""}
                    onChange={(e) => handleAcademicChange("strategic_plan", "sub_criteria_no", e.target.value)}
                    placeholder="e.g. 3.2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub-Criteria Title</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.strategic_plan?.sub_criteria_title || ""}
                    onChange={(e) => handleAcademicChange("strategic_plan", "sub_criteria_title", e.target.value)}
                    placeholder="e.g. Vibrant and enriching campus experience"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Graduate Attribute */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Graduate Attribute</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Criteria / Focus Area No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.graduate_attribute?.criteria || ""}
                    onChange={(e) => handleAcademicChange("graduate_attribute", "criteria", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub Criteria No.</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.graduate_attribute?.sub_criteria_no || ""}
                    onChange={(e) => handleAcademicChange("graduate_attribute", "sub_criteria_no", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Sub-Criteria Title</label>
                  <input
                    type="text"
                    value={fields?.academic_mapping?.graduate_attribute?.sub_criteria_title || ""}
                    onChange={(e) => handleAcademicChange("graduate_attribute", "sub_criteria_title", e.target.value)}
                    placeholder="e.g. Societal (Law Abiding)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: General Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>2. General Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title of the Activity</label>
                <input
                  type="text"
                  value={fields?.general_information?.title || ""}
                  onChange={(e) => handleGeneralChange("title", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Type of Activity</label>
                <input
                  type="text"
                  value={fields?.general_information?.type || ""}
                  onChange={(e) => handleGeneralChange("type", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Date/s</label>
                <input
                  type="text"
                  value={fields?.general_information?.date || ""}
                  onChange={(e) => handleGeneralChange("date", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Time</label>
                <input
                  type="text"
                  value={fields?.general_information?.time || ""}
                  onChange={(e) => handleGeneralChange("time", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Venue</label>
                <input
                  type="text"
                  value={fields?.general_information?.venue || ""}
                  onChange={(e) => handleGeneralChange("venue", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Collaboration / Sponsor</label>
                <input
                  type="text"
                  value={fields?.general_information?.collaboration || ""}
                  onChange={(e) => handleGeneralChange("collaboration", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Speaker / Guest / Presenter Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>3. Speaker / Guest Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Speaker Name</label>
                <input
                  type="text"
                  value={fields?.speaker_details?.name || ""}
                  onChange={(e) => handleSpeakerChange("name", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title / Position</label>
                <input
                  type="text"
                  value={fields?.speaker_details?.position || ""}
                  onChange={(e) => handleSpeakerChange("position", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Organization / Affiliation</label>
                <input
                  type="text"
                  value={fields?.speaker_details?.organization || ""}
                  onChange={(e) => handleSpeakerChange("organization", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Presentation Title</label>
                <input
                  type="text"
                  value={fields?.speaker_details?.presentation_title || ""}
                  onChange={(e) => handleSpeakerChange("presentation_title", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Participant Profile */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>4. Participant Profile</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Type of Participants</label>
                <input
                  type="text"
                  value={fields?.participant_profile?.participant_type || ""}
                  onChange={(e) => handleParticipantChange("participant_type", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">No. of Participants</label>
                <input
                  type="text"
                  value={fields?.participant_profile?.participant_count || ""}
                  onChange={(e) => handleParticipantChange("participant_count", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Synopsis of the Activity (Description) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>5. Synopsis of the Activity (Description)</span>
            </h4>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Highlights of the Activity</label>
              <textarea
                rows={4}
                value={fields?.highlights || ""}
                onChange={(e) => handleFieldChange("highlights", e.target.value)}
                placeholder="Highlights of the activity..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Key Objectives / Takeaways</label>
              <textarea
                rows={3}
                value={fields?.key_objectives || ""}
                onChange={(e) => handleFieldChange("key_objectives", e.target.value)}
                placeholder="Key objectives and takeaways..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Summary of the Activity</label>
              <textarea
                rows={4}
                value={fields?.summary || ""}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Summary narrative of the activity..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Follow-up Plan, if any</label>
              <input
                type="text"
                value={fields?.follow_up_plan || ""}
                onChange={(e) => handleFieldChange("follow_up_plan", e.target.value)}
                placeholder="None or next steps..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 6: Rapporteur Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>6. Rapporteur Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Name of the Rapporteur</label>
                <input
                  type="text"
                  value={fields?.rapporteur_details?.name || ""}
                  onChange={(e) => handleRapporteurChange("name", e.target.value)}
                  placeholder="e.g. Rapporteur Name"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Email and Contact No</label>
                <input
                  type="text"
                  value={fields?.rapporteur_details?.contact || ""}
                  onChange={(e) => handleRapporteurChange("contact", e.target.value)}
                  placeholder="e.g. rapporteur@christuniversity.in"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Extracted Images categorized */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Extracted Images ({images.length})</span>
            </h4>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Event_Poster', 'Photos', 'Attendance'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveImageCategory(cat)}
                className={`px-2 py-1 text-[11px] rounded font-medium transition ${
                  activeImageCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Images Grid */}
          {filteredImages.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No images found in this category.</p>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredImages.map((img) => (
                <div key={img.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <div className="aspect-video bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-2">
                    <img
                      src={img.web_url}
                      alt={img.filename}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono truncate max-w-[120px]">{img.filename}</span>
                    <select
                      value={img.category}
                      onChange={(e) => handleCategoryChange(img.id, e.target.value)}
                      className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    >
                      <option value="Event_Poster">Event Poster</option>
                      <option value="Photos">Photos</option>
                      <option value="Attendance">Attendance</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
