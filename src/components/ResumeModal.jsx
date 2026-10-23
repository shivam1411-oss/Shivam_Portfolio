import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, FileText, Loader2, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { emailjsConfig, profile } from '../data/content';
import Modal from './Modal';

function drawWatermark(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(width * 0.045)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = 'PREVIEW ONLY – REQUEST FULL COPY VIA EMAIL';
  const angle = (-30 * Math.PI) / 180;
  const stepY = height / 5;
  const stepX = width / 1.3;

  for (let y = 0; y < height + stepY; y += stepY) {
    for (let x = 0; x < width + stepX; x += stepX) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

// PDF.js renders to canvas only, so there are no native toolbar/download controls.
function ResumePreview() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const pdf = await pdfjs.getDocument(profile.resume).promise;
        if (cancelled) return;
        const container = containerRef.current;
        container.innerHTML = '';
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1.3 });
          const canvas = document.createElement('canvas');
          canvas.className = 'w-full h-auto mb-3 rounded-lg shadow-sm border border-line bg-white';
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.oncontextmenu = () => false;
          container.appendChild(canvas);
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          drawWatermark(ctx, canvas.width, canvas.height);
        }
        if (!cancelled) setStatus('ready');
      } catch (err) {
        console.error('PDF preview error:', err);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mb-7 rounded-2xl overflow-hidden border border-line bg-surface-2">
      <div
        className="h-[380px] md:h-[500px] overflow-y-auto p-3 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div ref={containerRef} />
        {status === 'loading' && (
          <div className="space-y-3 animate-pulse">
            {[0, 1].map((i) => (
              <div key={i} className="h-[440px] rounded-lg bg-surface border border-line" />
            ))}
          </div>
        )}
        {status === 'error' && <p className="text-center text-sm text-red-500 py-10">Preview unavailable right now.</p>}
      </div>
    </div>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResumeModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState('form'); // form | sending | sent

  // Reset each time the modal opens.
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setError('');
      setState('form');
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!emailPattern.test(email.trim())) return setError('Please enter a valid email address.');
    setError('');
    setState('sending');
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        { to_email: email.trim(), to_name: name.trim() },
        { publicKey: emailjsConfig.publicKey }
      );
      setState('sent');
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Something went wrong sending the email. Please try again.');
      setState('form');
    }
  };

  const inputClass =
    'w-full px-5 py-4 rounded-2xl bg-surface-2 border border-line text-sm text-fg placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition';

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl" label="Get resume">
      <AnimatePresence mode="wait" initial={false}>
        {state !== 'sent' ? (
          <motion.div key="form" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <FileText size={22} />
            </div>
            <h2 className="text-2xl font-extrabold text-fg mb-2">Get Resume</h2>
            <p className="text-sm text-muted mb-6">Preview Shivam's resume below, then enter your details to have it emailed to you.</p>

            <ResumePreview />

            <form onSubmit={submit} noValidate>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <label className="sr-only" htmlFor="resume-name">Your name</label>
                <input id="resume-name" type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                <label className="sr-only" htmlFor="resume-email">Your email address</label>
                <input id="resume-email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -3, 3, 0] }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs font-bold text-red-500 mb-3"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                type="submit"
                disabled={state === 'sending'}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-fg text-bg font-bold text-sm shadow-soft disabled:opacity-70"
              >
                {state === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {state === 'sending' ? 'Sending…' : 'Send Resume to My Email'}
              </motion.button>
              <p className="text-[11px] sm:text-[10px] text-subtle mt-4 text-center">
                Your email is only used to send this resume and won't be stored or shared.{' '}
                <a href="privacy.html" className="underline hover:text-muted">Privacy policy</a>
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent/10 text-accent flex items-center justify-center"
            >
              <CheckCircle2 size={34} />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-fg mb-2">Sent!</h2>
            <p className="text-sm text-muted mb-7 max-w-sm mx-auto">
              Check your inbox — the resume should arrive in a moment. If you don't see it, please check your Spam/Junk folder too.
            </p>
            <button type="button" onClick={onClose} className="w-full p-4 rounded-2xl bg-surface-2 border border-line text-fg font-bold text-sm hover:border-line-strong transition-colors">
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
