import { useState } from "react";
import type { UpdateInfo, UpdateStatus } from "../hooks/useUpdater";
import type { DisplayMode } from "../lib/settings/settings.types";
import type { WorkDay } from "../lib/settings/workSchedule";

type SettingsPanelProps = {
  alwaysOnTop: boolean;
  displayMode: DisplayMode;
  launchAtLogin: boolean;
  showDockIcon: boolean;
  showSeconds: boolean;
  breakEnabled: boolean;
  breakEndTime: string | null;
  breakStartTime: string | null;
  workProgressEnabled: boolean;
  workDays: WorkDay[];
  workEndTime: string | null;
  workStartTime: string | null;
  onBackToApp: () => void;
  onAlwaysOnTopChange: (alwaysOnTop: boolean) => void;
  onDisplayModeChange: (displayMode: DisplayMode) => void;
  onLaunchAtLoginChange: (launchAtLogin: boolean) => void;
  onShowDockIconChange: (showDockIcon: boolean) => void;
  onShowSecondsChange: (showSeconds: boolean) => void;
  onWorkProgressEnabledChange: (workProgressEnabled: boolean) => void;
  onWorkDaysChange: (workDays: WorkDay[]) => void;
  onWorkScheduleChange: (
    workStartTime: string | null,
    workEndTime: string | null,
    breakStartTime: string | null,
    breakEndTime: string | null,
    breakEnabled: boolean,
  ) => void;
  onCheckForUpdates: () => void;
  onInstallUpdate: () => void;
  updateAvailable: boolean;
  updateErrorMessage: string | null;
  updateInfo: UpdateInfo | null;
  updateStatus: UpdateStatus;
};

function getStatusTitle(updateStatus: UpdateStatus) {
  switch (updateStatus) {
    case "checking":
      return "チェック中";
    case "available":
      return "更新があります";
    case "downloading":
      return "ダウンロード中";
    case "installing":
      return "インストール中";
    case "up-to-date":
      return "最新です";
    case "installed":
      return "更新を適用しました";
    case "error":
      return "エラー";
    case "idle":
    default:
      return "未確認";
  }
}

function getStatusDescription(
  updateStatus: UpdateStatus,
  updateInfo: UpdateInfo | null,
  updateErrorMessage: string | null,
  updateAvailable: boolean,
) {
  if (!updateAvailable) {
    return "更新チェックは公開ビルドでのみ利用できます。開発中はこの表示になります。";
  }

  switch (updateStatus) {
    case "checking":
      return "GitHub Releases から新しいバージョンを確認しています。";
    case "available":
      return `バージョン ${updateInfo?.version ?? "不明"} を利用できます。`;
    case "downloading":
      return updateInfo?.progressPercent !== undefined
        ? `${updateInfo.progressPercent}% をダウンロードしました。`
        : "更新ファイルをダウンロードしています。";
    case "installing":
      return "更新を適用しています。完了までこの画面を閉じずにお待ちください。";
    case "up-to-date":
      return "現在のインストール済みバージョンが最新です。";
    case "installed":
      return "更新を適用しました。アプリを再起動してください。";
    case "error":
      return updateErrorMessage ?? "更新処理に失敗しました。";
    case "idle":
    default:
      return "必要なときに手動で更新を確認できます。";
  }
}

function formatByteProgress(updateInfo: UpdateInfo | null) {
  if (!updateInfo?.downloadedBytes || !updateInfo.contentLength) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return `${formatBytes(updateInfo.downloadedBytes)} / ${formatBytes(updateInfo.contentLength)}`;
}

export function SettingsPanel({
  alwaysOnTop,
  displayMode,
  launchAtLogin,
  showDockIcon,
  showSeconds,
  breakEnabled,
  breakEndTime,
  breakStartTime,
  workProgressEnabled,
  workDays,
  workEndTime,
  workStartTime,
  onBackToApp,
  onAlwaysOnTopChange,
  onDisplayModeChange,
  onLaunchAtLoginChange,
  onShowDockIconChange,
  onShowSecondsChange,
  onWorkProgressEnabledChange,
  onWorkDaysChange,
  onWorkScheduleChange,
  onCheckForUpdates,
  onInstallUpdate,
  updateAvailable,
  updateErrorMessage,
  updateInfo,
  updateStatus,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<"general" | "update">(
    "general",
  );
  const isBusy =
    updateStatus === "checking" ||
    updateStatus === "downloading" ||
    updateStatus === "installing";
  const [workStartDraft, setWorkStartDraft] = useState(workStartTime ?? "");
  const [workEndDraft, setWorkEndDraft] = useState(workEndTime ?? "");
  const [breakStartDraft, setBreakStartDraft] = useState(breakStartTime ?? "");
  const [breakEndDraft, setBreakEndDraft] = useState(breakEndTime ?? "");
  const canInstall =
    updateInfo !== null &&
    (updateStatus === "available" || updateStatus === "error");
  const byteProgress = formatByteProgress(updateInfo);
  const weekdayOptions: Array<{ label: string; value: WorkDay }> = [
    { label: "Mon", value: "mon" },
    { label: "Tue", value: "tue" },
    { label: "Wed", value: "wed" },
    { label: "Thu", value: "thu" },
    { label: "Fri", value: "fri" },
    { label: "Sat", value: "sat" },
    { label: "Sun", value: "sun" },
  ];

  return (
    <section aria-label="Settings panel" className="settings-panel">
      <div className="settings-panel__shell">
        <aside className="settings-panel__sidebar">
          <button
            className="settings-panel__back-link"
            type="button"
            onClick={onBackToApp}
          >
            <span aria-hidden="true">←</span>
            <span>アプリに戻る</span>
          </button>

          <nav aria-label="Settings sections" className="settings-panel__nav">
            <button
              aria-current={activeSection === "general" ? "page" : undefined}
              className={`settings-panel__nav-item${activeSection === "general" ? " settings-panel__nav-item--active" : ""}`}
              type="button"
              onClick={() => {
                setActiveSection("general");
              }}
            >
              <span className="settings-panel__nav-mark" aria-hidden="true" />
              一般
            </button>
            <button
              aria-current={activeSection === "update" ? "page" : undefined}
              className={`settings-panel__nav-item${activeSection === "update" ? " settings-panel__nav-item--active" : ""}`}
              type="button"
              onClick={() => {
                setActiveSection("update");
              }}
            >
              <span className="settings-panel__nav-mark" aria-hidden="true" />
              アップデート
            </button>
          </nav>
        </aside>

        <div className="settings-panel__content">
          <div className="settings-panel__header">
            <h1 className="settings-panel__title">
              {activeSection === "general" ? "一般" : "アップデート"}
            </h1>
          </div>

          <div className="settings-panel__card">
            {activeSection === "general" ? (
              <div className="settings-panel__list" role="list">
                <div
                  className="settings-panel__row settings-panel__row--list settings-panel__row--stack"
                  role="listitem"
                >
                  <span className="settings-panel__row-copy">
                    <span className="settings-panel__row-title">表示モード</span>
                    <span className="settings-panel__row-description">
                      用途に合わせて、時計と進捗の見せ方を切り替えます。
                    </span>
                  </span>
                  <div className="settings-panel__segmented" role="group" aria-label="表示モード">
                    {(["standard", "minimal", "focus", "ambient"] as const).map(
                      (mode) => (
                        <button
                          key={mode}
                          aria-pressed={displayMode === mode}
                          className="settings-panel__segment"
                          type="button"
                          onClick={() => {
                            onDisplayModeChange(mode);
                          }}
                        >
                          {mode[0].toUpperCase()}
                          {mode.slice(1)}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <label className="settings-panel__row settings-panel__row--list" role="listitem">
                  <span className="settings-panel__row-copy">
                    <span className="settings-panel__row-title">秒を表示</span>
                    <span className="settings-panel__row-description">
                      Standard と Minimal の時計に秒を表示します。
                    </span>
                  </span>
                  <input
                    aria-label="秒を表示"
                    className="settings-panel__switch-input"
                    checked={showSeconds}
                    type="checkbox"
                    onChange={(event) => {
                      onShowSecondsChange(event.target.checked);
                    }}
                  />
                </label>
                <label className="settings-panel__row settings-panel__row--list" role="listitem">
                  <span className="settings-panel__row-copy">
                    <span className="settings-panel__row-title">Dock アイコンを表示</span>
                    <span className="settings-panel__row-description">
                      Time を Dock とアプリ切り替えに表示します。
                    </span>
                  </span>
                  <input
                    aria-label="Dock アイコンを表示"
                    className="settings-panel__switch-input"
                    checked={showDockIcon}
                    type="checkbox"
                    onChange={(event) => {
                      onShowDockIconChange(event.target.checked);
                    }}
                  />
                </label>
                <label className="settings-panel__row settings-panel__row--list" role="listitem">
                  <span className="settings-panel__row-copy">
                    <span className="settings-panel__row-title">ログイン時に起動</span>
                    <span className="settings-panel__row-description">
                      macOS にログインしたときに Time を自動で起動します。
                    </span>
                  </span>
                  <input
                    aria-label="ログイン時に起動"
                    className="settings-panel__switch-input"
                    checked={launchAtLogin}
                    type="checkbox"
                    onChange={(event) => {
                      onLaunchAtLoginChange(event.target.checked);
                    }}
                  />
                </label>
                <label className="settings-panel__row settings-panel__row--list" role="listitem">
                  <span className="settings-panel__row-copy">
                    <span className="settings-panel__row-title">常に手前に表示</span>
                    <span className="settings-panel__row-description">
                      メインウィンドウを常にほかのウィンドウより前に表示します。
                    </span>
                  </span>
                  <input
                    aria-label="常に手前に表示"
                    className="settings-panel__switch-input"
                    checked={alwaysOnTop}
                    type="checkbox"
                    onChange={(event) => {
                      onAlwaysOnTopChange(event.target.checked);
                    }}
                  />
                </label>
                <div
                  className="settings-panel__row settings-panel__row--list settings-panel__row--work"
                  role="listitem"
                >
                  <div className="settings-panel__row-copy">
                    <h2 className="settings-panel__row-title">仕事時間</h2>
                    <p className="settings-panel__row-description">
                      開始と終了を設定すると、主画面に仕事の進捗を表示します。
                    </p>
                  </div>
                  <div className="settings-panel__time-fields">
                    <label className="settings-panel__toggle">
                      <span className="settings-panel__toggle-label">表示</span>
                      <input
                        aria-label="仕事時間を表示"
                        className="settings-panel__switch-input"
                        checked={workProgressEnabled}
                        type="checkbox"
                        onChange={(event) => {
                          onWorkProgressEnabledChange(event.target.checked);
                        }}
                      />
                    </label>
                    <label className="settings-panel__time-field">
                      <span>開始</span>
                      <input
                        aria-label="仕事開始時刻"
                        disabled={!workProgressEnabled}
                        type="time"
                        value={workStartDraft}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setWorkStartDraft(nextValue);
                          onWorkScheduleChange(
                            nextValue === "" ? null : nextValue,
                            workEndDraft === "" ? null : workEndDraft,
                            breakStartDraft === "" ? null : breakStartDraft,
                            breakEndDraft === "" ? null : breakEndDraft,
                            breakEnabled,
                          );
                        }}
                      />
                    </label>
                    <label className="settings-panel__time-field">
                      <span>終了</span>
                      <input
                        aria-label="仕事終了時刻"
                        disabled={!workProgressEnabled}
                        type="time"
                        value={workEndDraft}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setWorkEndDraft(nextValue);
                          onWorkScheduleChange(
                            workStartDraft === "" ? null : workStartDraft,
                            nextValue === "" ? null : nextValue,
                            breakStartDraft === "" ? null : breakStartDraft,
                            breakEndDraft === "" ? null : breakEndDraft,
                            breakEnabled,
                          );
                        }}
                      />
                    </label>
                    <label className="settings-panel__toggle">
                      <span className="settings-panel__toggle-label">休憩</span>
                      <input
                        aria-label="休憩時間を有効にする"
                        className="settings-panel__switch-input"
                        checked={breakEnabled}
                        disabled={!workProgressEnabled}
                        type="checkbox"
                        onChange={(event) => {
                          onWorkScheduleChange(
                            workStartDraft === "" ? null : workStartDraft,
                            workEndDraft === "" ? null : workEndDraft,
                            breakStartDraft === "" ? null : breakStartDraft,
                            breakEndDraft === "" ? null : breakEndDraft,
                            event.target.checked,
                          );
                        }}
                      />
                    </label>
                    <label className="settings-panel__time-field">
                      <span>休憩開始</span>
                      <input
                        aria-label="休憩開始時刻"
                        disabled={!workProgressEnabled || !breakEnabled}
                        type="time"
                        value={breakStartDraft}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setBreakStartDraft(nextValue);
                          onWorkScheduleChange(
                            workStartDraft === "" ? null : workStartDraft,
                            workEndDraft === "" ? null : workEndDraft,
                            nextValue === "" ? null : nextValue,
                            breakEndDraft === "" ? null : breakEndDraft,
                            breakEnabled,
                          );
                        }}
                      />
                    </label>
                    <label className="settings-panel__time-field">
                      <span>休憩終了</span>
                      <input
                        aria-label="休憩終了時刻"
                        disabled={!workProgressEnabled || !breakEnabled}
                        type="time"
                        value={breakEndDraft}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setBreakEndDraft(nextValue);
                          onWorkScheduleChange(
                            workStartDraft === "" ? null : workStartDraft,
                            workEndDraft === "" ? null : workEndDraft,
                            breakStartDraft === "" ? null : breakStartDraft,
                            nextValue === "" ? null : nextValue,
                            breakEnabled,
                          );
                        }}
                      />
                    </label>
                  </div>
                  <div className="settings-panel__weekday-fields" role="group" aria-label="勤務曜日">
                    {weekdayOptions.map((weekday) => (
                      <button
                        key={weekday.value}
                        aria-pressed={workDays.includes(weekday.value)}
                        className="settings-panel__weekday"
                        disabled={!workProgressEnabled}
                        type="button"
                        onClick={() => {
                          const nextWorkDays = workDays.includes(weekday.value)
                            ? workDays.filter((workDay) => workDay !== weekday.value)
                            : [...workDays, weekday.value];

                          onWorkDaysChange(nextWorkDays);
                        }}
                      >
                        {weekday.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="settings-panel__list" role="list">
                <div className="settings-panel__row settings-panel__row--list" role="listitem">
                  <div className="settings-panel__row-copy">
                    <h2 className="settings-panel__row-title">更新をチェック</h2>
                    <p className="settings-panel__row-description">
                      GitHub Releases から新しいバージョンを確認します。
                    </p>
                  </div>
                  <div className="settings-panel__row-actions">
                    <button
                      className="settings-panel__button"
                      disabled={isBusy || !updateAvailable}
                      type="button"
                      onClick={onCheckForUpdates}
                    >
                      更新をチェック
                    </button>
                    {canInstall ? (
                      <button
                        className="settings-panel__button settings-panel__button--primary"
                        disabled={isBusy || !updateAvailable}
                        type="button"
                        onClick={onInstallUpdate}
                      >
                        インストール
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="settings-panel__row settings-panel__row--list settings-panel__row--stack" role="listitem">
                  <div className="settings-panel__row-copy">
                    <h2 className="settings-panel__row-title">
                      {getStatusTitle(updateStatus)}
                    </h2>
                    <p className="settings-panel__row-description">
                      {getStatusDescription(
                        updateStatus,
                        updateInfo,
                        updateErrorMessage,
                        updateAvailable,
                      )}
                    </p>
                  </div>
                  {updateInfo ? (
                    <dl className="settings-panel__update-meta">
                      <div className="settings-panel__update-meta-item">
                        <dt>現在のバージョン</dt>
                        <dd>{updateInfo.currentVersion}</dd>
                      </div>
                      <div className="settings-panel__update-meta-item">
                        <dt>利用可能なバージョン</dt>
                        <dd>{updateInfo.version}</dd>
                      </div>
                      {updateInfo.date ? (
                        <div className="settings-panel__update-meta-item">
                          <dt>公開日</dt>
                          <dd>{updateInfo.date}</dd>
                        </div>
                      ) : null}
                      {byteProgress ? (
                        <div className="settings-panel__update-meta-item">
                          <dt>進行状況</dt>
                          <dd>{byteProgress}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                  {updateInfo?.notes ? (
                    <p className="settings-panel__update-notes">
                      {updateInfo.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
