import { s } from "./strings";

/** Illustrative mock of the SmartScreen dialog: CSS only, no Microsoft artwork.
 *  The muted blue panel is what people recognise; the thing to click gets the amber ring. */
export function SmartScreenMock({ step, fileName }: { step: 1 | 2; fileName: string }) {
  return (
    <figure className="m-0 flex h-full flex-col gap-3">
      <div className="flex-1 rounded-[var(--r-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 shadow-[var(--glass-highlight),var(--sh-3)]">
        <div aria-hidden="true" className="ss-panel">
          <p className="ss-title">{s.ssTitle}</p>
          <p className="ss-text">{s.ssText}</p>
          {step === 1 ? (
            <p className="ss-more">
              <span className="ss-hl">{s.ssMore}</span>
            </p>
          ) : (
            <dl className="ss-details">
              <div>
                <dt>{s.ssApp}</dt>
                <dd>{fileName}</dd>
              </div>
              <div>
                <dt>{s.ssPublisher}</dt>
                <dd>{s.ssUnknown}</dd>
              </div>
            </dl>
          )}
          <div className="ss-actions">
            {step === 2 && <span className="ss-btn ss-hl">{s.ssRun}</span>}
            <span className="ss-btn">{s.ssDontRun}</span>
          </div>
        </div>
      </div>
      <figcaption className="px-1 text-sm text-ink-2">{step === 1 ? s.mockStep1 : s.mockStep2}</figcaption>
    </figure>
  );
}
