import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { DRACOLoader } from "three-stdlib";
import * as THREE from "three";

type GLBViewerProps = {
  src: string;
  enableAutoRotate?: boolean;
};

type ViewState = {
  camPos: THREE.Vector3;
  target: THREE.Vector3;
};

function LoadingOverlay(): JSX.Element {
  return (
    <Html center>
      <div className="rounded-xl border bg-white px-4 py-3 text-xs font-semibold text-gray-700 shadow-sm">
        Loading 3D model…
      </div>
    </Html>
  );
}

type ModelWithAutoFitProps = {
  src: string;
  onFitted: (view: ViewState) => void;
};

const configureDracoLoader = (loader: DRACOLoader): void => {
  loader.setDecoderPath("/draco/gltf/");
  loader.setDecoderConfig({ type: "js" });
};

function ModelWithAutoFit({ src, onFitted }: ModelWithAutoFitProps): JSX.Element {
  const gltf = useGLTF(src, true, true, (loader) => {
    const dracoLoader = new DRACOLoader();
    configureDracoLoader(dracoLoader);
    loader.setDRACOLoader(dracoLoader);
  });
  const { camera, invalidate } = useThree();
  const fittedOnceRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    // ✅ run once per model src
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

    fittedOnceRef.current = true; // ✅ prevents loops
    invalidate();
  }, [camera, gltf.scene, invalidate, onFitted]);

  return <primitive object={gltf.scene} />;
}

type SceneProps = {
  src: string;
  enableAutoRotate: boolean;
};

function Scene({ src, enableAutoRotate }: SceneProps): JSX.Element {
  const controlsRef = useRef<
    | (THREE.EventDispatcher & { target: THREE.Vector3; update: () => void })
    | null
  >(null);
  const { camera, invalidate } = useThree();

  const [fittedView, setFittedView] = useState<ViewState | null>(null);

  // Once we have a fitted view, apply target to controls
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
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 2]} intensity={0.9} />
      <Environment preset="sunset" />

      {/* Model + auto-fit */}
      <ModelWithAutoFit src={src} onFitted={setFittedView} />

      {/* Controls */}
      <OrbitControls
        ref={(ref) => {
          // drei OrbitControls ref type isn't perfectly strict; we store minimal methods we use.
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

      {/* Reset button overlay */}
      <Html position={[0, 0, 0]} fullscreen>
        <div className="pointer-events-none absolute right-3 top-3">
          <button
            type="button"
            onClick={resetView}
            className="pointer-events-auto rounded-xl border bg-white/90 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white transition"
            disabled={!fittedView}
          >
            Reset view
          </button>
        </div>
      </Html>
    </>
  );
}

export default function GLBViewer({
  src,
  enableAutoRotate = true,
}: GLBViewerProps): JSX.Element {
  return (
    <Canvas
      // ✅ big stability wins:
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
      // shadows are expensive; enable later if you really need them
      shadows={false}
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      className="h-full w-full"
      onCreated={({ gl }) => {
        // Optional: avoid super high pixel ratio spikes
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}
    >
      <Suspense fallback={<LoadingOverlay />}>
        <Scene src={src} enableAutoRotate={enableAutoRotate} />
      </Suspense>
    </Canvas>
  );
}
