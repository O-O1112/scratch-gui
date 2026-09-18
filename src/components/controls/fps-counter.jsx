import React, {useState, useEffect, useRef} from 'react';

const FpsCounter = () => {
    const [fps, setFps] = useState(60);
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const animId = useRef(null);

    useEffect(() => {
        const loop = now => {
            frameCount.current++;
            const delta = now - lastTime.current;
            if (delta >= 500) {
                const currentFps = Math.round((frameCount.current * 1000) / delta);
                setFps(currentFps);
                frameCount.current = 0;
                lastTime.current = now;
            }
            animId.current = requestAnimationFrame(loop);
        };
        animId.current = requestAnimationFrame(loop);
        return () => {
            if (animId.current) cancelAnimationFrame(animId.current);
        };
    }, []);

    let color = '#27ae60'; // Green
    if (fps < 25) {
        color = '#e67e22'; // Orange
    } else if (fps < 45) {
        color = '#f39c12'; // Yellow/amber
    }

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.15rem 0.45rem',
                margin: '0 0.4rem',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                color: color,
                border: `1px solid ${color}55`,
                userSelect: 'none',
                verticalAlign: 'middle'
            }}
            title="即時畫面渲染幀率 (FPS)"
        >
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                    marginRight: '4px'
                }}
            />
            {fps} FPS
        </div>
    );
};

export default FpsCounter;
