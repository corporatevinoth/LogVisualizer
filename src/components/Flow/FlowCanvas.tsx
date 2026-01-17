import { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
    NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ParsedData } from '../../types';
import { CustomNode } from './CustomNode';

interface FlowCanvasProps {
    data: ParsedData | null;
}

const nodeTypes = {
    serviceNode: CustomNode,
};

export function FlowCanvas({ data }: FlowCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

    useEffect(() => {
        if (!data) return;

        // 1. Identify services & stats
        const serviceMap = new Map<string, { hasErrors: boolean; hasHighLatency: boolean }>();

        // Helper to get or init
        const getService = (name: string) => {
            if (!serviceMap.has(name)) {
                serviceMap.set(name, { hasErrors: false, hasHighLatency: false });
            }
            return serviceMap.get(name)!;
        }

        data.logs.forEach(log => {
            const source = getService(log.service_name);
            if (log.level === 'ERROR' || log.level === 'FATAL' || (log.status_code && log.status_code >= 400)) {
                source.hasErrors = true;
            }
            if (log.duration_ms > 2000) {
                source.hasHighLatency = true;
            }

            if (log.interaction_target) {
                getService(log.interaction_target);
            }
        });

        // 2. Build Nodes
        const serviceNames = Array.from(serviceMap.keys());
        const newNodes: Node[] = serviceNames.map((name, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);

            return {
                id: name,
                type: 'serviceNode',
                position: { x: col * 350 + 100, y: row * 250 + 100 },
                data: {
                    label: name,
                    ...serviceMap.get(name)!,
                    isDimmed: false // Init as not dimmed
                },
            };
        });

        // 3. Build Edges
        const newEdges: Edge[] = [];
        const edgeSet = new Set<string>();

        data.logs.forEach(log => {
            if (log.interaction_target && log.interaction_target !== log.service_name) {
                const edgeId = `${log.service_name}-${log.interaction_target}`;
                if (!edgeSet.has(edgeId)) {
                    edgeSet.add(edgeId);
                    newEdges.push({
                        id: edgeId,
                        source: log.service_name,
                        target: log.interaction_target,
                        animated: true,
                        style: { stroke: '#06b6d4', strokeWidth: 2, opacity: 1 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#06b6d4',
                        },
                    });
                }
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setHighlightedNode(null);
    }, [data, setNodes, setEdges]);

    // Handle Highlighting
    const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setHighlightedNode(curr => curr === node.id ? null : node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setHighlightedNode(null);
    }, []);

    // Effect to update visual state based on highlight
    useEffect(() => {
        setNodes(nds => nds.map(node => {
            if (!highlightedNode) return { ...node, data: { ...node.data, isDimmed: false } };

            // Check if connected
            const isConnected = node.id === highlightedNode ||
                edges.some(e =>
                    (e.source === highlightedNode && e.target === node.id) ||
                    (e.target === highlightedNode && e.source === node.id)
                );

            return { ...node, data: { ...node.data, isDimmed: !isConnected } };
        }));

        setEdges(eds => eds.map(edge => {
            if (!highlightedNode) return { ...edge, style: { ...edge.style, opacity: 1 }, animated: true };

            const isConnected = edge.source === highlightedNode || edge.target === highlightedNode;

            return {
                ...edge,
                style: { ...edge.style, opacity: isConnected ? 1 : 0.1 },
                animated: isConnected
            };
        }));

    }, [highlightedNode, setNodes, setEdges, edges]); // Re-run when highlight changes

    return (
        <div className="w-full h-full bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
            >
                <Background gap={24} size={1} color="#1e293b" />
                <Controls className="bg-slate-900 border-slate-800 text-slate-400 fill-slate-400" />
            </ReactFlow>
        </div>
    );
}
