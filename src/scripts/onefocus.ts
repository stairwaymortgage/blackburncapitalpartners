// Sends website leads to OneFocus CRM (business: Blackburn Capital Partners, residential).
// Do NOT point this at "blackburn-capital": that business belongs to blackburn.capital (hotels).
const ENDPOINT = 'https://www.onefocuscrm.com/api/forms/blackburn-capital-partners';

declare global {
  interface Window { OneFocus?: { attribution: () => unknown } }
}

export function wireForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-onefocus]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('.form-status');
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const out: Record<string, unknown> = { form: form.dataset.onefocus };
      new FormData(form).forEach((v, k) => { if (v !== '') out[k] = v; });
      if (window.OneFocus) out._of = window.OneFocus.attribution();
      const label = btn?.textContent ?? '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        const r = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(out),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        if (status) { status.textContent = 'Thank you. We received your property and will reach out within one business day.'; status.style.color = '#1F4D3A'; }
      } catch {
        if (status) { status.textContent = 'Sorry, that did not go through. Please try again in a moment.'; status.style.color = '#9B2C1B'; }
      }
      if (btn) { btn.disabled = false; btn.textContent = label; }
    });
  });
}
