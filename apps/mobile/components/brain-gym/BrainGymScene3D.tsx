import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import '../../lib/brain-gym/three-native-shim';
import * as THREE from 'three';
import { GAMES } from '../../lib/brain-gym/registry';
import {
  buildHubSceneLayout,
  hubSceneCameraForViewport,
} from '../../lib/brain-gym/hub-scene-layout';
import { createHubSceneRenderer } from '../../lib/brain-gym/expo-gl-renderer';
import { createHubSceneGraph } from '../../lib/brain-gym/hub-scene-three';
import { useBrainGym } from '../../lib/brain-gym/hooks/useBrainGym';

function HeroCubeFallback() {
  return (
    <View style={styles.fallbackWrap}>
      <LinearGradient colors={[theme.colors.purple, '#4a44a8']} style={styles.fallbackCube}>
        <Text style={styles.fallbackText}>BRAIN{'\n'}GYM</Text>
      </LinearGradient>
    </View>
  );
}

export function BrainGymScene3D() {
  const { progress } = useBrainGym();
  const [failed, setFailed] = useState(false);
  const draggingRef = useRef(false);
  const rotationYRef = useRef(0.55);
  const lastDxRef = useRef(0);
  const disposeRef = useRef<(() => void) | null>(null);
  const startedRef = useRef(false);
  const sizeRef = useRef({ width: 360, height: 360 });
  const chipRefs = useRef<Array<View | null>>([]);
  const projectScratch = useRef(new THREE.Vector3());

  const layout = useMemo(
    () =>
      buildHubSceneLayout(
        GAMES.map((g) => ({ id: g.id, color: g.color, category: g.category })),
        Object.fromEntries(
          GAMES.map((g) => [g.id, progress.games[g.id]?.plays ?? 0]),
        ),
      ),
    [progress.games],
  );

  useEffect(() => () => disposeRef.current?.(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!startedRef.current) setFailed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          draggingRef.current = true;
          lastDxRef.current = 0;
        },
        onPanResponderMove: (_, g) => {
          rotationYRef.current += (g.dx - lastDxRef.current) * 0.01;
          lastDxRef.current = g.dx;
        },
        onPanResponderRelease: () => {
          draggingRef.current = false;
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
        },
      }),
    [],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    sizeRef.current = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
  };

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      startedRef.current = true;
      const { renderer } = createHubSceneRenderer(gl);
      const pose = hubSceneCameraForViewport(sizeRef.current.height);
      const { scene, camera, root, labelAnchors, dispose } = createHubSceneGraph(
        layout,
        pose,
      );

      let raf = 0;
      let alive = true;
      const tick = () => {
        if (!alive) return;
        if (!draggingRef.current) rotationYRef.current += 0.0008;
        root.rotation.y = rotationYRef.current;

        const fitted = hubSceneCameraForViewport(sizeRef.current.height);
        camera.fov = fitted.fov;
        camera.position.set(...fitted.position);
        camera.lookAt(...fitted.target);
        camera.aspect = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
        gl.endFrameEXP();

        const { width, height } = sizeRef.current;
        const world = projectScratch.current;
        const chipW = 96;
        labelAnchors.forEach((anchor, i) => {
          const node = chipRefs.current[i];
          if (!node) return;
          anchor.object.getWorldPosition(world);
          world.project(camera);
          const x = (world.x * 0.5 + 0.5) * width;
          const y = (-world.y * 0.5 + 0.5) * height;
          const onScreen =
            world.z < 1 && x > 8 && x < width - 8 && y > 8 && y < height - 8;
          node.setNativeProps({
            style: {
              left: Math.min(Math.max(x - chipW / 2, 4), width - chipW - 4),
              top: Math.min(Math.max(y - 12, 4), height - 28),
              opacity: onScreen ? 1 : 0,
            },
          });
        });

        raf = requestAnimationFrame(tick);
      };
      tick();

      disposeRef.current = () => {
        alive = false;
        cancelAnimationFrame(raf);
        dispose();
        renderer.dispose();
      };
    } catch (err) {
      console.warn('[brain-gym] 3D hub failed', err);
      setFailed(true);
    }
  };

  if (failed) return <HeroCubeFallback />;

  return (
    <View style={styles.root} onLayout={onLayout} {...pan.panHandlers}>
      <GLView
        style={StyleSheet.absoluteFill}
        msaaSamples={0}
        onContextCreate={onContextCreate}
      />
      {layout.clusters.map((cluster, i) => (
        <View
          key={cluster.category}
          ref={(node) => {
            chipRefs.current[i] = node;
          }}
          pointerEvents="none"
          style={styles.clusterChip}
        >
          <Text style={styles.clusterChipText}>
            {cluster.emoji} {cluster.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  clusterChip: {
    position: 'absolute',
    left: -200,
    top: -200,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  clusterChipText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackCube: {
    width: 88,
    height: 88,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }],
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 16,
  },
});
