import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
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
  const { progress, loaded, total } = useProgress();

  return (
    <Html center>
      <div className="rounded-xl border bg-white px-4 py-3 text-xs font-semibold text-gray-700 shadow-sm">
        <div>Loading 3D model…</div>
        <div className="mt-1 text-gray-500">
          {Math.round(progress)}% ({loaded}/{total})
        </div>
        <div className="mt-2 h-2 w-44 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-gray-900 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

type ModelWithAutoFitProps = {
  src: string;
  onFitted: (view: ViewState) => void;
};

function ModelWithAutoFit({
  src,
  onFitted,
}: ModelWithAutoFitProps): JSX.Element {
  const gltf = useGLTF(src);
  const { camera, invalidate } = useThree();

  useMemo(() => {
    // Enable shadows (optional)
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [gltf.scene]);

  useLayoutEffect(() => {
    // Compute bounds
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 45;

    // distance so the model fits in view
    const fitDistance =
      maxDim / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const distance = fitDistance * 1.25; // add breathing room

    // Position camera slightly above center for nicer view
    const newCamPos = new THREE.Vector3(
      center.x,
      center.y + maxDim * 0.12,
      center.z + distance,
    );

    camera.position.copy(newCamPos);
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    // Store fitted view for reset
    onFitted({
      camPos: newCamPos.clone(),
      target: center.clone(),
    });

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
      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />

      {/* Nice lighting preset */}
      <Environment preset="studio" />

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
      shadows
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      className="h-full w-full"
    >
      <Suspense fallback={<LoadingOverlay />}>
        <Scene src={src} enableAutoRotate={enableAutoRotate} />
      </Suspense>
    </Canvas>
  );
}
