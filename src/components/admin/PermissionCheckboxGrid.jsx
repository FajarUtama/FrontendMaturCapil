import { PERMISSIONS } from '../../constants/permissions';

export const PermissionCheckboxGrid = ({ selected = [], onChange, disabled = false }) => {
  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];

  const toggle = (code) => {
    if (disabled) return;
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <div key={group} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">{group}</h5>
          <div className="flex flex-col gap-2">
            {PERMISSIONS.filter((p) => p.group === group).map((perm) => (
              <label
                key={perm.code}
                className={`flex items-start gap-2 text-xs cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(perm.code)}
                  onChange={() => toggle(perm.code)}
                  disabled={disabled}
                  className="mt-0.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <span>
                  <span className="font-semibold text-slate-800 block">{perm.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{perm.code}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
