import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import './Layer.css';

const Layer = ({
    type,
    label,
    index,
    params = {},
    updateLayerParams,
    position,
    onPositionChange,
    onConnectorMouseDown,
    onConnectorMouseUp
}) => {
    const layerRef = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'layer',
        item: { type, label, index },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    });

    useEffect(() => {
        if (layerRef.current && position) {
            layerRef.current.style.left = `${position.x}px`;
            layerRef.current.style.top = `${position.y}px`;
        }
    }, [position]);

    const handleInputChange = (e) => {
        if (!updateLayerParams) return;
        const { name, value } = e.target;
        updateLayerParams(index, { [name]: parseInt(value, 10) });
    };

    return (
        <div
            ref={(node) => {
                layerRef.current = node;
                drag(node);
            }}
            className={`layer ${isDragging ? 'dragging' : ''}`}
            style={{
                opacity: isDragging ? 0.5 : 1,
                position: 'absolute',
                left: position?.x || 0,
                top: position?.y || 0
            }}
        >
            {/* Input connector */}
            <div
                className="connector input-connector"
                onMouseUp={() => onConnectorMouseUp(index, 'input')}
            />

            {/* Output connector */}
            <div
                className="connector output-connector"
                onMouseDown={() => onConnectorMouseDown(index, 'output')}
            />

            <h4>{label}</h4>
            {type === 'linear' && params && (
                <div className="layer-params">
                    <label>Input Features:</label>
                    <input
                        type="number"
                        name="in_features"
                        value={params.in_features || ''}
                        onChange={handleInputChange}
                        placeholder="Input Features"
                    />
                    <label>Output Features:</label>
                    <input
                        type="number"
                        name="out_features"
                        value={params.out_features || ''}
                        onChange={handleInputChange}
                        placeholder="Output Features"
                    />
                </div>
            )}
            {type === 'conv2d' && params && (
                <div className="layer-params">
                    <label>In Channels:</label>
                    <input
                        type="number"
                        name="in_channels"
                        value={params.in_channels || ''}
                        onChange={handleInputChange}
                        placeholder="In Channels"
                    />
                    <label>Out Channels:</label>
                    <input
                        type="number"
                        name="out_channels"
                        value={params.out_channels || ''}
                        onChange={handleInputChange}
                        placeholder="Out Channels"
                    />
                    <label>Kernel Size:</label>
                    <input
                        type="number"
                        name="kernel_size"
                        value={params.kernel_size || ''}
                        onChange={handleInputChange}
                        placeholder="Kernel Size"
                    />
                </div>
            )}
        </div>
    );
};

export default Layer;
