import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import { CATEGORY_META, GAMES } from '../../lib/brain-gym/registry';
import {
  buildHubSceneLayout,
  HUB_SCENE_CATEGORIES,
  HUB_SCENE_CATEGORY_COLORS,
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
  const rotationYRef = useRef(0);
  const lastDxRef = useRef(0);
  const disposeRef = useRef<(() => void) | null>(null);
  const startedRef = useRef(false);

  useEffect(() => () => disposeRef.current?.(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!startedRef.current) setFailed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      startedRef.current = true;
      const { renderer } = createHubSceneRenderer(gl);
      const { scene, camera, root, dispose } = createHubSceneGraph(layout);
      camera.aspect = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);
      camera.updateProjectionMatrix();

      let raf = 0;
      let alive = true;
      const tick = () => {
        if (!alive) return;
        if (!draggingRef.current) rotationYRef.current += 0.0008;
        root.rotation.y = rotationYRef.current;
        renderer.render(scene, camera);
        gl.endFrameEXP();
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
    <View style={styles.root} {...pan.panHandlers}>
      <GLView
        style={StyleSheet.absoluteFill}
        msaaSamples={0}
        onContextCreate={onContextCreate}
      />
      <View pointerEvents="none" style={styles.centerLabel}>
        <Text style={styles.centerLabelText}>BRAIN{'\n'}GYM</Text>
      </View>
      <View pointerEvents="none" style={styles.legend}>
        {HUB_SCENE_CATEGORIES.map((cat) => (
          <View
            key={cat}
            style={[styles.legendChip, { borderColor: HUB_SCENE_CATEGORY_COLORS[cat] }]}
          >
            <Text style={styles.legendText}>
              {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 15,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  legend: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  legendChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  legendText: { color: '#f8fafc', fontSize: 11, fontWeight: '700' },
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
