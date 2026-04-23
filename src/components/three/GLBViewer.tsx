import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";

type GLBViewerProps = {
  src: string;
  enableAutoRotate?: boolean;
};

type ViewState = {
  camPos: THREE.Vector3;
  target: THREE.Vector3;
};

type ViewerStatus = "loading" | "ready" | "error";

const LOAD_TIMEOUT_MS = 30000;
const PRECHECK_TIMEOUT_MS = 12000;

const getAssetLabel = (src: string): string => {
  try {
    const url = new URL(src, window.location.origin);
    return url.pathname.split("/").pop() ?? "model";
  } catch {
    return src.split("/").pop() ?? "model";
  }
};

const verifyModelSource = async (
  src: string,
  signal: AbortSignal,
): Promise<{ ok: boolean; message?: string }> => {
  if (!src) {
    return { ok: false, message: "No model URL was provided." };
  }

  try {
    const response = await fetch(src, {
      method: "GET",
      headers: { Range: "bytes=0-1023" },
      signal,
      cache: "no-store",
    });

    if (!response.ok && response.status !== 206) {
      return {
        ok: false,
        message: `Model file request failed with status ${response.status}.`,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      contentType &&
      !contentType.includes("model/gltf-binary") &&
      !contentType.includes("application/octet-stream") &&
      !contentType.includes("binary/octet-stream")
    ) {
      return {
        ok: false,
        message: `Unexpected content type: ${contentType}.`,
      };
    }

    return { ok: true };
  } catch (error) {
    if (signal.aborted) {
      return { ok: false, message: "The model check was cancelled." };
    }

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.name === "AbortError"
            ? "Timed out while checking the model file."
            : error.message
          : "The model file could not be reached.",
    };
  }
};

function LoadingOverlay(): JSX.Element {
  const { progress, active, errors, item, loaded, total } = useProgress();
  const boundedProgress = Math.max(8, Math.min(100, Math.round(progress)));
  const showSlowHint = active && loaded === 0 && total === 0;

  return (
    <Html center>
      <div className="w-56 rounded-xl border bg-white/96 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
          <span>Loading 3D Model</span>
          <span>{boundedProgress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-800 transition-[width] duration-200"
            style={{ width: `${boundedProgress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-gray-600">
          {item ? `Fetching ${item.split("/").pop() ?? "model"}...` : "Downloading geometry and textures..."}
        </p>
        {showSlowHint ? (
          <p className="mt-1 text-[11px] text-gray-500">
            Preparing decoder and model file...
          </p>
        ) : null}
        {errors.length > 0 ? (
          <p className="mt-1 text-[11px] text-red-600">
            The 3D file could not be loaded.
          </p>
        ) : null}
      </div>
    </Html>
  );
}

type ModelWithAutoFitProps = {
  src: string;
  onFitted: (view: ViewState) => void;
  onReady: () => void;
};

function ModelWithAutoFit({
  src,
  onFitted,
  onReady,
}: ModelWithAutoFitProps): JSX.Element {
  const gltf = useGLTF(src, "/draco/gltf/", false);
  const { camera, invalidate } = useThree();
  const fittedOnceRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    // Reset the one-time fit when the active model changes.
    fittedOnceRef.current = false;
  }, [src]);

  useLayoutEffect(() => {
    if (fittedOnceRef.current) return;

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = cam.fov ?? 45;

    const fitDistance =
      maxDim / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const distance = fitDistance * 1.75;

    const newCamPos = new THREE.Vector3(
      center.x,
      center.y + maxDim * 0.12,
      center.z + distance,
    );

    cam.position.copy(newCamPos);
    cam.near = Math.max(distance / 100, 0.01);
    cam.far = distance * 100;
    cam.updateProjectionMatrix();

    onFitted({ camPos: newCamPos.clone(), target: center.clone() });
    onReady();

    fittedOnceRef.current = true;
    invalidate();
  }, [camera, gltf.scene, invalidate, onFitted, onReady]);

  return <primitive object={gltf.scene} />;
}

type SceneProps = {
  src: string;
  enableAutoRotate: boolean;
  onReady: () => void;
};

function Scene({ src, enableAutoRotate, onReady }: SceneProps): JSX.Element {
  const controlsRef = useRef<
    | (THREE.EventDispatcher & { target: THREE.Vector3; update: () => void })
    | null
  >(null);
  const { camera, invalidate } = useThree();

  const [fittedView, setFittedView] = useState<ViewState | null>(null);

  useEffect(() => {
    if (!fittedView) return;
    const controls = controlsRef.current;
    if (!controls) return;

    controls.target.copy(fittedView.target);
    controls.update();
    invalidate();
  }, [fittedView, invalidate]);

  const resetView = (): void => {
    if (!fittedView) return;

    camera.position.copy(fittedView.camPos);
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(fittedView.target);
      controls.update();
    }

    invalidate();
  };

  return (
    <>
      <ambientLight intensity={1} />
      <hemisphereLight
        args={["#f8fafc", "#cbd5e1", 1.1]}
        position={[0, 1, 0]}
      />
      <directionalLight position={[4, 5, 3]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} />

      <ModelWithAutoFit src={src} onFitted={setFittedView} onReady={onReady} />

      <OrbitControls
        ref={(ref) => {
          controlsRef.current = ref as unknown as
            | (THREE.EventDispatcher & {
                target: THREE.Vector3;
                update: () => void;
              })
            | null;
        }}
        enablePan={false}
        autoRotate={enableAutoRotate}
        autoRotateSpeed={1.0}
      />

      <Html position={[0, 0, 0]} fullscreen>
        <div className="pointer-events-none absolute right-3 top-3">
          <button
            type="button"
            onClick={resetView}
            className="pointer-events-auto rounded-xl border bg-white/90 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-white"
            disabled={!fittedView}
          >
            Reset view
          </button>
        </div>
      </Html>
    </>
  );
}

class ViewerErrorBoundary extends Component<
  { children: JSX.Element },
  { hasError: boolean }
> {
  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  state = { hasError: false };

  componentDidCatch(): void {}

  render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
          The 3D model could not be displayed.
        </div>
      );
    }

    return this.props.children;
  }
}

export default function GLBViewer({
  src,
  enableAutoRotate = true,
}: GLBViewerProps): JSX.Element {
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Preparing 3D model viewer...",
  );
  const timeoutRef = useRef<number | null>(null);

  const handleReady = useCallback(
    () => (): void => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setStatus("ready");
      setStatusMessage("");
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const precheckTimeoutId = window.setTimeout(() => {
      controller.abort();
    }, PRECHECK_TIMEOUT_MS);

    setStatus("loading");
    setStatusMessage(`Checking ${getAssetLabel(src)}...`);

    void (async (): Promise<void> => {
      const precheck = await verifyModelSource(src, controller.signal);
      window.clearTimeout(precheckTimeoutId);
      if (cancelled) return;

      if (!precheck.ok) {
        setStatus("error");
        setStatusMessage(
          precheck.message ??
            "The model file could not be reached from this browser.",
        );
        return;
      }

      setStatusMessage("Downloading geometry and textures...");
      useGLTF.preload(src, "/draco/gltf/", false);

      timeoutRef.current = window.setTimeout(() => {
        setStatus((current) => (current === "ready" ? current : "error"));
        setStatusMessage(
          "The model file is reachable, but rendering did not finish in time.",
        );
      }, LOAD_TIMEOUT_MS);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(precheckTimeoutId);
      controller.abort();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      useGLTF.clear(src);
    };
  }, [src]);

  if (status === "error") {
    return (
      <div className="flex h-full items-center justify-center bg-muted px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-foreground">
            This 3D model could not be displayed.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {statusMessage}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Check the file path, bucket access, and the model export in Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ViewerErrorBoundary>
      <Canvas
        key={src}
        frameloop={enableAutoRotate ? "always" : "demand"}
        dpr={[1, 1.1]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
        }}
        shadows={false}
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        className="h-full w-full"
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.1));

          const handleContextLost = (event: Event): void => {
            event.preventDefault();
            setStatus("error");
            setStatusMessage(
              "WebGL context was lost while rendering. This usually points to a large model or texture set.",
            );
          };

          canvas.addEventListener("webglcontextlost", handleContextLost, {
            passive: false,
          });

          const originalDispose = gl.dispose.bind(gl);
          gl.dispose = (): void => {
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            originalDispose();
          };
        }}
      >
        <Suspense fallback={<LoadingOverlay />}>
          <Scene
            src={src}
            enableAutoRotate={enableAutoRotate}
            onReady={handleReady}
          />
        </Suspense>
      </Canvas>
    </ViewerErrorBoundary>
  );
}
