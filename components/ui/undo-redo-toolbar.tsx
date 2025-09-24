'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Undo2, Redo2, History, ChevronDown } from 'lucide-react';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { cn } from '@/lib/utils';

interface UndoRedoToolbarProps {
    className?: string;
    showHistory?: boolean;
    size?: 'sm' | 'default' | 'lg';
}

export function UndoRedoToolbar({ className, showHistory = true, size = 'default' }: UndoRedoToolbarProps) {
    const { canUndo, canRedo, undoDescription, redoDescription, undo, redo, getUndoStack, getRedoStack, clear } = useUndoRedo();
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const undoStack = getUndoStack();
    const redoStack = getRedoStack();

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Undo Button */}
            <Button
                variant="outline"
                size={size}
                onClick={undo}
                disabled={!canUndo}
                title={undoDescription ? `Undo: ${undoDescription}` : 'Nothing to undo'}
                className="flex items-center gap-2"
            >
                <Undo2 className="h-4 w-4" />
                {size !== 'sm' && 'Undo'}
            </Button>

            {/* Redo Button */}
            <Button
                variant="outline"
                size={size}
                onClick={redo}
                disabled={!canRedo}
                title={redoDescription ? `Redo: ${redoDescription}` : 'Nothing to redo'}
                className="flex items-center gap-2"
            >
                <Redo2 className="h-4 w-4" />
                {size !== 'sm' && 'Redo'}
            </Button>

            {/* History Dropdown */}
            {showHistory && (undoStack.length > 0 || redoStack.length > 0) && (
                <DropdownMenu open={showHistoryDropdown} onOpenChange={setShowHistoryDropdown}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size={size}
                            className="flex items-center gap-1"
                        >
                            <History className="h-4 w-4" />
                            {size !== 'sm' && 'History'}
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                        <div className="p-2">
                            <div className="text-sm font-medium mb-2">Action History</div>

                            {/* Undo Stack */}
                            {undoStack.length > 0 && (
                                <>
                                    <div className="text-xs text-muted-foreground mb-1">Can Undo:</div>
                                    {undoStack.slice(-10).reverse().map((action, index) => (
                                        <DropdownMenuItem
                                            key={action.id}
                                            className="flex items-center justify-between p-2 text-xs"
                                            disabled={index > 0} // Only allow undoing the most recent action
                                            onClick={() => index === 0 && undo()}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">{action.description}</div>
                                                <div className="text-muted-foreground">{action.type}</div>
                                            </div>
                                            <div className="text-muted-foreground ml-2">
                                                {formatTimestamp(action.timestamp)}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}

                            {/* Redo Stack */}
                            {redoStack.length > 0 && (
                                <>
                                    {undoStack.length > 0 && <DropdownMenuSeparator />}
                                    <div className="text-xs text-muted-foreground mb-1">Can Redo:</div>
                                    {redoStack.slice(-10).reverse().map((action, index) => (
                                        <DropdownMenuItem
                                            key={action.id}
                                            className="flex items-center justify-between p-2 text-xs"
                                            disabled={index > 0} // Only allow redoing the most recent action
                                            onClick={() => index === 0 && redo()}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">{action.description}</div>
                                                <div className="text-muted-foreground">{action.type}</div>
                                            </div>
                                            <div className="text-muted-foreground ml-2">
                                                {formatTimestamp(action.timestamp)}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}

                            {/* Clear History */}
                            {(undoStack.length > 0 || redoStack.length > 0) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={clear}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Clear History
                                    </DropdownMenuItem>
                                </>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}