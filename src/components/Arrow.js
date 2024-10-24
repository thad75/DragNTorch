import React from 'react';

const Arrow = ({ startPos, endPos }) => {
    // Calculate the path for the arrow
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const angle = Math.atan2(dy, dx);

    // Arrow head parameters
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6; // 30 degrees

    // Calculate arrow head points
    const arrowHead1 = {
        x: endPos.x - arrowLength * Math.cos(angle - arrowAngle),
        y: endPos.y - arrowLength * Math.sin(angle - arrowAngle)
    };
    const arrowHead2 = {
        x: endPos.x - arrowLength * Math.cos(angle + arrowAngle),
        y: endPos.y - arrowLength * Math.sin(angle + arrowAngle)
    };

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
        >
            {/* Main line */}
            <line
                x1={startPos.x}
                y1={startPos.y}
                x2={endPos.x}
                y2={endPos.y}
                stroke="#666"
                strokeWidth="2"
            />
            {/* Arrow head */}
            <path
                d={`M ${endPos.x} ${endPos.y} L ${arrowHead1.x} ${arrowHead1.y} M ${endPos.x} ${endPos.y} L ${arrowHead2.x} ${arrowHead2.y}`}
                stroke="#666"
                strokeWidth="2"
                fill="none"
            />
        </svg>
    );
};

export default Arrow;