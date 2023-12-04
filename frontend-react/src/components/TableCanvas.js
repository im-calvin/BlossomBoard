import React, { useState } from "react";
import { socket } from "../socket";
import "../style/table.css";

const TableHome = () => {
    const [cells, setCells] = useState(Array(9).fill().map(() => Array(9).fill('')));

    const colorCodes = ['#49B3FF', '#FFBF74', '#EE89FF', '#FF698D', '#44FF83', '#FFCFCF', '#9F53FF', '#53FFF5', '#FCFF59'];

    const getCellColor = (clusterIndex, rowIndex, colIndex) => {
        if (clusterIndex === 4) {
            // For cells in the central cluster, color is based on their position
            const outerClusterIndex = (Math.floor(rowIndex - 3) * 3) + Math.floor(colIndex - 3);
            return colorCodes[outerClusterIndex];
        } else {
            // For central cells of other clusters, color is based on the cluster index
            const isCentralCell = Math.floor(rowIndex % 3) === 1 && Math.floor(colIndex % 3) === 1;
            return isCentralCell ? colorCodes[clusterIndex] : '';
        }
    };

    var clusters = [];
    for (let i = 0; i < 9; i++) {
        clusters.push([]);
        for (let j = 0; j < 9; j++) {
            clusters[i].push([]);
        }
    }

    const isClusterActive = (clusterIndex) => {
        if (clusterIndex === 4) {
            return true; // Central cluster is always active
        }

        const rowIndex = Math.floor(clusterIndex / 3) + 3;
        const colIndex = (clusterIndex % 3) + 3;

        return cells[rowIndex][colIndex] !== '';
    };

    const clearClusterCells = (clusterIndex) => {
        setCells(currentCells => 
            currentCells.map((row, ri) => 
                row.map((col, ci) => {
                    if (Math.floor(ri / 3) === Math.floor(clusterIndex / 3) && Math.floor(ci / 3) === clusterIndex % 3) {
                        return '';
                    }
                    return col;
                })
            )
        );
    };

    const handleCellChange = (row, col, value) => {
        // Update the cell value first
        setCells(currentCells => 
            currentCells.map((r, ri) => 
                r.map((c, ci) => 
                    ri === row && ci === col ? value : c
                )
            )
        );
    
        // Check if the edited cell is in the middle cluster
        if (row >= 3 && row < 6 && col >= 3 && col < 6) {
            // After updating the cell, check if it's completely empty
            if (value === '') {
                const clusterIndex = (Math.floor(row - 3) * 3) + Math.floor(col - 3);
                clearClusterCells(clusterIndex);
            }
        }
    
        // Emit the change to socket if needed
        socket.emit('cellChange', { row, col, value });
    };
    
    
    
    
    

    const getMiddleCellValue = (clusterIndex) => {
        // Calculate the corresponding cell in the central cluster
        const rowIndex = Math.floor(clusterIndex / 3) + 3;
        const colIndex = (clusterIndex % 3) + 3;
        
        return cells[rowIndex][colIndex];
    };

    return (
        <div style={{height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className="clusterContainer">
                {clusters.map((cluster, clusterIndex) => {
                    const active = isClusterActive(clusterIndex);
                    return (
                        <div className={`cluster ${active ? 'active' : 'inactive'}`} key={clusterIndex}>
                            {cluster.map((cell, cellIndex) => {
                                const rowIndex = Math.floor(clusterIndex / 3) * 3 + Math.floor(cellIndex / 3);
                                const colIndex = (clusterIndex % 3) * 3 + (cellIndex % 3);
                                const cellColor = getCellColor(clusterIndex, rowIndex, colIndex);
                                const cellStyle = { backgroundColor: cellColor };

                                const isMiddleCell = Math.floor(cellIndex / 3) === 1 && (cellIndex % 3) === 1;
                                const middleCellValue = isMiddleCell ? getMiddleCellValue(clusterIndex) : cells[rowIndex][colIndex];

                                return (
                                    <textarea
                                        className="cell"
                                        key={cellIndex}
                                        style={cellStyle}
                                        value={middleCellValue}
                                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                    />
                                )
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default TableHome;
