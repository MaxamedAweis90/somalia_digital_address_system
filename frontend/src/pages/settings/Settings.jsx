import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  createSetting,
  deleteSetting,
  getSettings,
  updateSetting,
} from "@/api/settingsApi";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

const CATEGORIES = ["general", "addressing", "maps", "system"];

function groupByCategory(settings) {
  return settings.reduce((groups, setting) => {
    const category = setting.category || "general";
    if (!groups[category]) groups[category] = [];
    groups[category].push(setting);
    return groups;
  }, {});
}

function SettingField({ setting, isAdmin, onSaved }) {
  const [value, setValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setValue(setting.value);
  }, [setting.value]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateSetting(setting.id, { value });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = () => {
    if (setting.type === "BOOLEAN") {
      const isOn = value === "true";

      if (!isAdmin) {
        return (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-bg border border-line text-ink">
            {value}
          </span>
        );
      }

      return (
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          onClick={() => setValue(isOn ? "false" : "true")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
            isOn ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      );
    }

    if (setting.type === "JSON") {
      return (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!isAdmin}
          rows={4}
          className="w-full rounded-lg border border-[#B9C2CE] bg-white px-3 py-2 text-[13px] font-mono outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-gray-50"
        />
      );
    }

    return (
      <input
        type={setting.type === "NUMBER" ? "number" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!isAdmin}
        className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-gray-50"
      />
    );
  };

  return (
    <div className="rounded-lg border border-line bg-[#FBFCFE] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-ink">{setting.label}</p>
          <p className="mt-0.5 text-[11px] font-mono text-ink-soft">{setting.key}</p>
          {setting.description && (
            <p className="mt-1 text-[12px] text-ink-soft">{setting.description}</p>
          )}
        </div>
        <span className="rounded-md bg-white border border-line px-2 py-1 text-[10px] font-semibold uppercase text-ink-soft">
          {setting.type}
        </span>
      </div>

      <div className="mt-3">{renderInput()}</div>

      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}

      {isAdmin && value !== setting.value && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[32px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;
  const basePath = isAdmin ? "/admin" : "/officer";

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: "",
    label: "",
    value: "",
    description: "",
    category: "general",
    type: "STRING",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSettings();
      setSettings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const grouped = useMemo(() => groupByCategory(settings), [settings]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      await createSetting(newSetting);
      setShowAddForm(false);
      setNewSetting({
        key: "",
        label: "",
        value: "",
        description: "",
        category: "general",
        type: "STRING",
      });
      fetchSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create setting");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (setting) => {
    if (setting.isSystem) return;

    const confirmDelete = window.confirm(`Delete setting "${setting.label}"?`);
    if (!confirmDelete) return;

    try {
      await deleteSetting(setting.id);
      fetchSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete setting");
    }
  };

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", onClick: () => navigate(`${basePath}/dashboard`) },
            { label: "Settings" },
          ]}
        />

        <PageHeader
          title="System Settings"
          description={
            isAdmin
              ? "Configure registry behavior and portal options."
              : "View current system configuration (read-only)."
          }
          actions={
            isAdmin ? (
              <button
                onClick={() => setShowAddForm((current) => !current)}
                className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Setting
              </button>
            ) : null
          }
        />

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {showAddForm && isAdmin && (
          <div className="mb-6 max-w-[760px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="text-[16px] font-semibold text-ink">New Configuration</h2>
            </div>
            <form onSubmit={handleCreate} className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Key</label>
                  <input
                    value={newSetting.key}
                    onChange={(e) =>
                      setNewSetting((prev) => ({ ...prev, key: e.target.value }))
                    }
                    placeholder="e.g. max_upload_size"
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Label</label>
                  <input
                    value={newSetting.label}
                    onChange={(e) =>
                      setNewSetting((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="Display name"
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Category</label>
                  <select
                    value={newSetting.category}
                    onChange={(e) =>
                      setNewSetting((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px] cursor-pointer"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Type</label>
                  <select
                    value={newSetting.type}
                    onChange={(e) =>
                      setNewSetting((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px] cursor-pointer"
                  >
                    <option value="STRING">STRING</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Value</label>
                  <input
                    value={newSetting.value}
                    onChange={(e) =>
                      setNewSetting((prev) => ({ ...prev, value: e.target.value }))
                    }
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">
                  Description
                </label>
                <input
                  value={newSetting.description}
                  onChange={(e) =>
                    setNewSetting((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Setting"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          </div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.filter((category) => grouped[category]?.length).map((category) => (
              <div
                key={category}
                className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-line">
                  <h2 className="text-[16px] font-semibold text-ink capitalize">{category}</h2>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {grouped[category].map((setting) => (
                    <div key={setting.id} className="relative">
                      <SettingField
                        setting={setting}
                        isAdmin={isAdmin}
                        onSaved={fetchSettings}
                      />
                      {isAdmin && !setting.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDelete(setting)}
                          className="absolute top-3 right-3 p-1.5 rounded-md text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Delete setting"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
