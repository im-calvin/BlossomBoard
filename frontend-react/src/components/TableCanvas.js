import React, { useState } from "react";
import { socket } from "../socket";
import "../style/table.css";
import { useEffect } from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Share the room code with your peers
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="text"
          placeholder="Enter Email address"
          className="form-control"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            alert("Board shared successfully!");
            props.onHide();
          }}
        >
          Share
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const TableHome = () => {
  const [modalShow, setModalShow] = React.useState(false);
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const username = sessionStorage.getItem("username");
  const { roomCode } = useParams();
  // Create a mutable ref for roomCode
  var roomCodeRef = useRef(roomCode);

  useEffect(() => {
    console.log("roomcode ref is updated to: " + roomCode);
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  const [cells, setCells] = useState(
    Array(9)
      .fill()
      .map(() => Array(9).fill(""))
  );
  useEffect(() => {
    const setupWebSocket = () => {
      // Replace with your actual data for joining a room
      socket.emit("join", { username, room: roomCode });

      socket.on("connect", () => {
        // Handle WebSocket connection established
        console.log("Connected to WebSocket");
      });

      socket.on("disconnect", () => {
        // Handle WebSocket disconnection
        console.log("Disconnected from WebSocket");
      });

      socket.on("cellUpdate", (data) => {
        console.log("Received cell update: ", data);
        // Update the state based on the data received
        setCells((currentCells) =>
          currentCells.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === data.row && colIndex === data.col ? data.value : cell
            )
          )
        );
      });
    };
    setupWebSocket();

    return () => {
      // Clean up WebSocket listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("cellUpdate");
    };
  }, []);

  const colorCodes = [
    "#49B3FF",
    "#FFBF74",
    "#EE89FF",
    "#FF698D",
    "#44FF83",
    "#FFCFCF",
    "#9F53FF",
    "#53FFF5",
    "#FCFF59",
  ];

  const getCellColor = (clusterIndex, rowIndex, colIndex) => {
    if (clusterIndex === 4) {
      // For cells in the central cluster, color is based on their position
      const outerClusterIndex =
        Math.floor(rowIndex - 3) * 3 + Math.floor(colIndex - 3);
      return colorCodes[outerClusterIndex];
    } else {
      // For central cells of other clusters, color is based on the cluster index
      const isCentralCell =
        Math.floor(rowIndex % 3) === 1 && Math.floor(colIndex % 3) === 1;
      return isCentralCell ? colorCodes[clusterIndex] : "";
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

    return cells[rowIndex][colIndex] !== "";
  };

  const clearClusterCells = (clusterIndex) => {
    setCells((currentCells) =>
      currentCells.map((row, ri) =>
        row.map((col, ci) => {
          if (
            Math.floor(ri / 3) === Math.floor(clusterIndex / 3) &&
            Math.floor(ci / 3) === clusterIndex % 3
          ) {
            return "";
          }
          return col;
        })
      )
    );
  };

  const handleCellChange = (row, col, value) => {
    // Update the cell value first
    setCells((currentCells) =>
      currentCells.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? value : c))
      )
    );

    // Check if the edited cell is in the middle cluster
    if (row >= 3 && row < 6 && col >= 3 && col < 6) {
      // After updating the cell, check if it's completely empty
      if (value === "") {
        const clusterIndex = Math.floor(row - 3) * 3 + Math.floor(col - 3);
        clearClusterCells(clusterIndex);
      }
    }

    // Emit the change to socket if needed
    socket.emit("cellChange", { row, col, value, room: roomCode });
  };

  const getMiddleCellValue = (clusterIndex) => {
    // Calculate the corresponding cell in the central cluster
    const rowIndex = Math.floor(clusterIndex / 3) + 3;
    const colIndex = (clusterIndex % 3) + 3;

    return cells[rowIndex][colIndex];
  };

  return (
    <>
    <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="/">
              Lotus Blossom Board 
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                Room Code : {roomCode} <span className="mx-2">  </span>
                <Button variant="primary" onClick={() => setModalShow(true)}>
                  Share
                </Button>
              </Navbar.Text>
              
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      <div
        style={{
          height: "85vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden"
        }}
      >

        <div className="clusterContainer">
          {clusters.map((cluster, clusterIndex) => {
            const active = isClusterActive(clusterIndex);
            return (
              <div
                className={`cluster ${active ? "active" : "inactive"}`}
                key={clusterIndex}
              >
                {cluster.map((cell, cellIndex) => {
                  const rowIndex =
                    Math.floor(clusterIndex / 3) * 3 +
                    Math.floor(cellIndex / 3);
                  const colIndex = (clusterIndex % 3) * 3 + (cellIndex % 3);
                  const cellColor = getCellColor(
                    clusterIndex,
                    rowIndex,
                    colIndex
                  );
                  const cellStyle = { backgroundColor: cellColor };

                  const isMiddleCell =
                    Math.floor(cellIndex / 3) === 1 && cellIndex % 3 === 1;
                  const middleCellValue = isMiddleCell
                    ? getMiddleCellValue(clusterIndex)
                    : cells[rowIndex][colIndex];

                  return (
                    <textarea
                      className="cellCustom"
                      key={cellIndex}
                      style={cellStyle}
                      value={middleCellValue}
                      onChange={(e) =>
                        handleCellChange(rowIndex, colIndex, e.target.value)
                      }
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TableHome;
