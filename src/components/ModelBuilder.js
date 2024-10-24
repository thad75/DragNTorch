import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layer from './Layer';
import Arrow from './Arrow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import './ModelBuilder.css';

const DEFAULT_PARAMS = {
    linear: {
        in_features: 512,
        out_features: 256
    },
    conv2d: {
        in_channels: 3,
        out_channels: 64,
        kernel_size: 3
    }
};

const ModelBuilder = () => {
    const canvasRef = useRef(null);
    const [layers, setLayers] = useState([]);
    const [zoom, setZoom] = useState(1);
    const [connections, setConnections] = useState([]);
    const [activeConnection, setActiveConnection] = useState(null);

    // Available layers list
    const availableLayers = [
        { type: 'linear', label: 'Linear Layer' },
        { type: 'conv2d', label: 'Convolutional Layer' },
        { type: 'relu', label: 'ReLU Activation' }
    ];

    const [{ isOver }, drop] = useDrop({
        accept: 'layer',
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const x = (offset.x - canvasRect.left) / zoom;
            const y = (offset.y - canvasRect.top) / zoom;
            addLayerToModel(item.type, { x, y });
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    const addLayerToModel = (layerType, position) => {
        const newLayer = {
            id: Date.now(),
            type: layerType,
            label: layerType.charAt(0).toUpperCase() + layerType.slice(1) + ' Layer',
            params: DEFAULT_PARAMS[layerType] || {},
            position: position || { x: 100, y: 100 }
        };
        setLayers((prevLayers) => [...prevLayers, newLayer]);
    };

    const updateLayerParams = (index, newParams) => {
        setLayers(prevLayers => {
            const updatedLayers = [...prevLayers];
            updatedLayers[index] = {
                ...updatedLayers[index],
                params: {
                    ...updatedLayers[index].params,
                    ...newParams
                }
            };
            return updatedLayers;
        });
    };

    const updateLayerPosition = (index, newPosition) => {
        setLayers(prevLayers => {
            const updatedLayers = [...prevLayers];
            updatedLayers[index] = {
                ...updatedLayers[index],
                position: newPosition
            };
            return updatedLayers;
        });
    };

    const handleConnectorMouseDown = (sourceIndex, connectorType) => {
        if (connectorType === 'output') {
            setActiveConnection({
                sourceIndex,
                startPos: getConnectorPosition(sourceIndex, 'output')
            });
        }
    };

    const handleConnectorMouseUp = (targetIndex, connectorType) => {
        if (activeConnection && connectorType === 'input' && targetIndex !== activeConnection.sourceIndex) {
            // Check if connection already exists
            const connectionExists = connections.some(
                conn => conn.sourceIndex === activeConnection.sourceIndex && conn.targetIndex === targetIndex
            );

            if (!connectionExists) {
                setConnections(prev => [
                    ...prev,
                    {
                        sourceIndex: activeConnection.sourceIndex,
                        targetIndex,
                        id: `${activeConnection.sourceIndex}-${targetIndex}`
                    }
                ]);
            }
        }
        setActiveConnection(null);
    };

    const handleMouseMove = (e) => {
        if (activeConnection) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - canvasRect.left) / zoom;
            const y = (e.clientY - canvasRect.top) / zoom;
            setActiveConnection(prev => ({
                ...prev,
                currentPos: { x, y }
            }));
        }
    };

    const getConnectorPosition = (index, type) => {
        const layerEl = document.querySelector(`[data-layer-index="${index}"]`);
        if (!layerEl) return { x: 0, y: 0 };

        const rect = layerEl.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();

        return {
            x: type === 'input' ? rect.left - canvasRect.left : rect.right - canvasRect.left,
            y: (rect.top + rect.height / 2) - canvasRect.top
        };
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    const handleDeleteConnection = (connectionId) => {
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="model-builder">
                <div className="available-layers">
                    <h3>Available Layers</h3>
                    {availableLayers.map((layer, index) => (
                        <Layer key={index} type={layer.type} label={layer.label} isDraggable />
                    ))}
                </div>

                <div
                    className="canvas-container"
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setActiveConnection(null)}
                >
                    <div className="zoom-controls">
                        <FontAwesomeIcon
                            icon={faSearchPlus}
                            onClick={handleZoomIn}
                            className="zoom-button"
                        />
                        <FontAwesomeIcon
                            icon={faSearchMinus}
                            onClick={handleZoomOut}
                            className="zoom-button"
                        />
                    </div>

                    <div
                        ref={(node) => {
                            canvasRef.current = node;
                            drop(node);
                        }}
                        className={`canvas ${isOver ? 'drag-over' : ''}`}
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left'
                        }}
                    >
                        {layers.map((layer, index) => (
                            <Layer
                                key={layer.id}
                                index={index}
                                type={layer.type}
                                label={layer.label}
                                params={layer.params}
                                position={layer.position}
                                updateLayerParams={updateLayerParams}
                                updatePosition={(pos) => updateLayerPosition(index, pos)}
                                onConnectorMouseDown={handleConnectorMouseDown}
                                onConnectorMouseUp={handleConnectorMouseUp}
                                data-layer-index={index}
                                isDraggable={false}
                            />
                        ))}

                        {connections.map(connection => (
                            <Arrow
                                key={connection.id}
                                startPos={getConnectorPosition(connection.sourceIndex, 'output')}
                                endPos={getConnectorPosition(connection.targetIndex, 'input')}
                                onClick={() => handleDeleteConnection(connection.id)}
                            />
                        ))}

                        {activeConnection && activeConnection.currentPos && (
                            <Arrow
                                startPos={activeConnection.startPos}
                                endPos={activeConnection.currentPos}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default ModelBuilder;
