import { useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
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

    useEffect(() => {
        if (!data) return;

        // 1. Identify unique services (Nodes)
        const serviceMap = new Map<string, { hasErrors: boolean; hasHighLatency: boolean }>();

        data.logs.forEach(log => {
            const current = serviceMap.get(log.service_name) || { hasErrors: false, hasHighLatency: false };
            if (log.status_code >= 400) current.hasErrors = true;
            if (log.duration_ms > 2000) current.hasHighLatency = true;
            serviceMap.set(log.service_name, current);

            if (log.interaction_target) {
                // Ensure target exists in map too, even if we don't have logs FROM it
                if (!serviceMap.has(log.interaction_target)) {
                    serviceMap.set(log.interaction_target, { hasErrors: false, hasHighLatency: false });
                }
            }
        });

        // 2. Create Layout (Manual Grid for now since we lack dagre)
        // Simple logic: distribute in a grid or circle
        const serviceNames = Array.from(serviceMap.keys());
        const newNodes: Node[] = serviceNames.map((name, index) => {
            // Simple positioning logic: 3 columns
            const col = index % 3;
            const row = Math.floor(index / 3);

            return {
                id: name,
                type: 'serviceNode',
                position: { x: col * 350 + 100, y: row * 250 + 100 }, // Increased spacing
                data: {
                    label: name,
                    hasErrors: serviceMap.get(name)!.hasErrors,
                    hasHighLatency: serviceMap.get(name)!.hasHighLatency
                },
            };
        });

        // 3. Create Edges
        const newEdges: Edge[] = [];
        const edgeSet = new Set<string>();

        data.logs.forEach(log => {
            if (log.interaction_target) {
                const edgeId = `${log.service_name}-${log.interaction_target}`;
                if (!edgeSet.has(edgeId) && log.interaction_target !== log.service_name) {
                    edgeSet.add(edgeId);
                    newEdges.push({
                        id: edgeId,
                        source: log.service_name,
                        target: log.interaction_target,
                        animated: true,
                        style: { stroke: '#06b6d4', strokeWidth: 2 },
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
    }, [data, setNodes, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background gap={20} size={1} color="#334155" />
                <Controls className="bg-slate-800 border-slate-700 text-slate-400 fill-slate-400" />
            </ReactFlow>
        </div>
    );
}
