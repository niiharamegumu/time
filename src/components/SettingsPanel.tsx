type SettingsPanelProps = {
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (alwaysOnTop: boolean) => void;
};

export function SettingsPanel({
  alwaysOnTop,
  onAlwaysOnTopChange,
}: SettingsPanelProps) {
  return (
    <section aria-label="Settings panel" className="settings-panel">
      <div className="settings-panel__layout">
        <aside className="settings-panel__sidebar">
          <p className="settings-panel__sidebar-title">Time</p>
          <button
            aria-current="page"
            className="settings-panel__nav-item"
            type="button"
          >
            一般
          </button>
        </aside>

        <div className="settings-panel__content">
          <div className="settings-panel__header">
            <p className="settings-panel__eyebrow">General</p>
            <h1 className="settings-panel__title">一般</h1>
          </div>

          <div className="settings-panel__section">
            <label className="settings-panel__row">
              <span className="settings-panel__row-copy">
                <span className="settings-panel__row-title">常に手前に表示</span>
                <span className="settings-panel__row-description">
                  メインウィンドウを常にほかのウィンドウより前に表示します。
                </span>
              </span>
              <input
                aria-label="常に手前に表示"
                checked={alwaysOnTop}
                type="checkbox"
                onChange={(event) => {
                  onAlwaysOnTopChange(event.target.checked);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
