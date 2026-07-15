import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { BarChart3, Factory, FileUp, Gauge, Menu, ShieldCheck, X } from 'lucide-react';
import styles from './HeroSection.module.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url?: string;
        'events-target'?: string;
      };
    }
  }
}

const SPLINE_SCENE_URL = 'https://prod.spline.design/jy3wX1wO7Csr14qu/scene.splinecode';
const SPLINE_VIEWER_SCRIPT = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';

const featurePills = [
  { icon: Gauge, label: 'Machine Data Intelligence' },
  { icon: ShieldCheck, label: 'Early Failure Detection' },
  { icon: BarChart3, label: 'Live Production Visibility' },
];

const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Upload', href: '#upload' },
  { label: 'AI Control Room', href: '#ai-control-room' },
  { label: 'Results', href: '#results' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Reports', href: '#reports' },
  { label: 'Documentation', href: '#documentation' },
];

let splineScriptPromise: Promise<void> | null = null;

const loadSplineViewer = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (customElements.get('spline-viewer')) {
    return Promise.resolve();
  }

  if (!splineScriptPromise) {
    splineScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${SPLINE_VIEWER_SCRIPT}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = SPLINE_VIEWER_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return splineScriptPromise;
};

const forceTransparentSplineSurface = (element: HTMLElement) => {
  element.style.background = 'transparent';
  element.style.backgroundColor = 'transparent';
  element.setAttribute('background', 'transparent');

  let observer: MutationObserver | undefined;
  let frameId = 0;
  let attempts = 0;

  const applyTransparentSurface = () => {
    const shadowRoot = element.shadowRoot;

    if (!shadowRoot) return;

    // Inject styles to hide Spline brand logo/watermark and loaders
    if (!shadowRoot.querySelector('#hide-spline-logo-style')) {
      const style = document.createElement('style');
      style.id = 'hide-spline-logo-style';
      style.textContent = `
        #logo, 
        a[href*="spline.design"], 
        .spline-watermark, 
        #spline-logo,
        #loader,
        [id*="loader"],
        [id*="loading"],
        [class*="loader"],
        [class*="loading"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      shadowRoot.appendChild(style);
    }

    shadowRoot
      .querySelectorAll<HTMLElement>('canvas, div, section')
      .forEach((node) => {
        node.style.background = 'transparent';
        node.style.backgroundColor = 'transparent';
      });
  };

  const attachObserver = () => {
    applyTransparentSurface();

    if (!element.shadowRoot || observer) return;

    observer = new MutationObserver(applyTransparentSurface);
    observer.observe(element.shadowRoot, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  };

  const retryUntilUpgraded = () => {
    attachObserver();
    attempts += 1;

    if (!observer && attempts < 90) {
      frameId = window.requestAnimationFrame(retryUntilUpgraded);
    }
  };

  retryUntilUpgraded();

  return {
    disconnect: () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frameId);
    },
  };
};

export const HeroSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldMountSpline, setShouldMountSpline] = useState(false);
  const [isSplineReady, setIsSplineReady] = useState(false);
  const [useMobileLayout, setUseMobileLayout] = useState(false);
  const robotRef = useRef<HTMLElement | null>(null);

  const splineAppRef = useRef<any>(null);
  const headRef = useRef<any>(null);
  const initialRotationRef = useRef<{ x: number; y: number } | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let frameId = 0;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        // Calculate relative coordinates [-0.5, 0.5] from center of viewport
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        // Move X maps to Y rotation, Move Y maps to X rotation
        const maxRotationY = 0.45; // Max 0.45 rad (~25 deg) left/right
        const maxRotationX = 0.25; // Max 0.25 rad (~15 deg) up/down

        targetRotationRef.current = {
          x: y * maxRotationX,
          y: x * maxRotationY,
        };
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    let animationFrameId = 0;

    const updateRotation = () => {
      // Lazy load/resolve the head object if it's not found yet but the Spline App is loaded
      if (!headRef.current && splineAppRef.current) {
        const splineApp = splineAppRef.current;
        let headObj: any = null;

        const scene = splineApp.scene || splineApp._scene || splineApp.scene3D;

        if (scene) {
          console.log("=== Traversing Spline Scene Graph ===");
          scene.traverse((child: any) => {
            if (child.name) {
              console.log("Object Name:", child.name);
              if (/head/i.test(child.name)) {
                headObj = child;
                console.log("[MATCH] Found head object:", child.name);
              }
            }
          });
          console.log("=====================================");

          // Fallback search patterns if head was not found
          if (!headObj) {
            const fallbackPatterns = [/face/i, /neck/i, /joint/i, /skull/i, /eye/i];
            for (const pattern of fallbackPatterns) {
              scene.traverse((child: any) => {
                if (child.name && pattern.test(child.name)) {
                  headObj = child;
                  console.log(`[MATCH FALLBACK] Found object matching ${pattern.source}:`, child.name);
                }
              });
              if (headObj) break;
            }
          }
        }

        if (!headObj && typeof splineApp.findObjectByName === 'function') {
          headObj = splineApp.findObjectByName('head') || splineApp.findObjectByName('Head');
        }

        if (headObj) {
          headRef.current = headObj;
          initialRotationRef.current = {
            x: headObj.rotation.x,
            y: headObj.rotation.y,
          };
        }
      }

      const head = headRef.current;
      const initial = initialRotationRef.current;

      if (head && initial) {
        // Lerp factor for smooth head movement
        const lerpFactor = 0.08;
        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;

        head.rotation.x = initial.x + currentRotationRef.current.x;
        head.rotation.y = initial.y + currentRotationRef.current.y;
      }

      animationFrameId = requestAnimationFrame(updateRotation);
    };

    animationFrameId = requestAnimationFrame(updateRotation);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSplineReady]);

  useEffect(() => {
    let isMounted = true;
    let firstFrame = 0;
    let secondFrame = 0;

    const mediaQuery = window.matchMedia('(max-width: 900px)');

    const updateMobileLayout = () => {
      setUseMobileLayout(mediaQuery.matches);
    };

    updateMobileLayout();
    mediaQuery.addEventListener('change', updateMobileLayout);

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!isMounted) return;
        setShouldMountSpline(true);

        loadSplineViewer()
          .catch(() => {
            if (!isMounted) return;
            setIsSplineReady(true);
          });
      });
    });

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      mediaQuery.removeEventListener('change', updateMobileLayout);
    };
  }, []);

  useEffect(() => {
    const robot = robotRef.current;
    if (!robot) return;

    const handleReady = () => {
      setIsSplineReady(true);
      const splineApp = (robot as any).spline || (robot as any)._spline || (robot as any).splineApp || (robot as any).app;
      if (splineApp) {
        splineAppRef.current = splineApp;
      }
    };
    const transparencyObserver = forceTransparentSplineSurface(robot);

    robot.addEventListener('load', handleReady, { once: true });
    robot.addEventListener('spline-load', handleReady, { once: true });

    const revealTimer = window.setTimeout(handleReady, 6500);

    return () => {
      robot.removeEventListener('load', handleReady);
      robot.removeEventListener('spline-load', handleReady);
      window.clearTimeout(revealTimer);
      transparencyObserver?.disconnect();
    };
  }, [shouldMountSpline]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const heroClassName = useMemo(
    () => `${styles.hero} ${useMobileLayout ? styles.forceMobileLayout : ''}`,
    [useMobileLayout],
  );

  return (
    <section className={heroClassName} aria-labelledby="factoryfix-hero-title">
      <nav className={styles.nav} aria-label="Hero navigation">
        <a className={styles.navLogo} href="#" aria-label="FactoryFIX home">
          <Factory size={24} strokeWidth={2.4} />
          <span>FactoryFIX</span>
        </a>

        <div className={styles.navLinks}>
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              className={`${styles.navLink} ${index === 0 ? styles.active : ''}`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a className={styles.navCta} href="#upload">
          <FileUp size={16} />
          Upload Factory Data
        </a>

        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
          Menu
        </button>
      </nav>

      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <div className={styles.mobileMenuHeader}>
            <a className={styles.navLogo} href="#" onClick={() => setIsMenuOpen(false)}>
              <Factory size={24} strokeWidth={2.4} />
              <span>FactoryFIX</span>
            </a>
            <button
              type="button"
              className={styles.closeMenuBtn}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={28} />
            </button>
          </div>

          <div className={styles.mobileMenuLinks}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>

          <div className={styles.mobileMenuFooter}>
            <a className={styles.navCta} href="#upload" onClick={() => setIsMenuOpen(false)}>
              <FileUp size={16} />
              Upload Factory Data
            </a>
          </div>
        </div>
      )}

      <h1 id="factoryfix-hero-title" className={styles.bgText}>
        FACTORY
        <br />
        INTELLIGENCE
      </h1>

      <div className={styles.robotStage} aria-hidden="true">

        {shouldMountSpline && (
          <spline-viewer
            ref={robotRef}
            className={styles.background}
            url={SPLINE_SCENE_URL}
            events-target="global"
          />
        )}
      </div>

      <div className={styles.heroActions}>
        <a className={styles.primaryButton} href="#upload">
          <FileUp size={18} />
          Upload Factory Data
        </a>
        <a className={styles.secondaryButton} href="#overview">
          See How It Works
        </a>
      </div>

      <div className={styles.featurePills} aria-label="FactoryFIX capabilities">
        {featurePills.map((feature) => (
          <span className={styles.featurePill} key={feature.label}>
            <feature.icon size={16} />
            {feature.label}
          </span>
        ))}
      </div>

      <div className={styles.heroBadge}>
        <span>AI Badge</span>
        <span>Predictive Manufacturing Intelligence</span>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
};
