import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Button, Typography, useTheme } from "@mui/material";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import ParkIcon from '@mui/icons-material/Park';
export const BlogShowGraph = () => {
  const [data, setData] = useState<{ time: string, temp: number, humi: number}[]>([]);
  const theme = useTheme()
  const [colorBox, setColorBox] = useState('#1F2A40')
  const [status, setStatus] = useState(0)
  const socketRef = useRef(null);
  const reconnectInterval = useRef(1000); 
  useEffect(() => {
    if (theme.palette.mode === 'dark'){
      setColorBox('#1F2A40')
    }
    else{
      setColorBox('#D6D8DD')
    }
  }, [theme])
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/sensor/');
    socket.onmessage = function(e){
      const djangoData = JSON.parse(e.data);
      document.getElementById('temp').innerText = djangoData.temperature
      document.getElementById('humid').innerText = djangoData.humidity
      document.getElementById('soil').innerText = djangoData.soilmoisture
      setData((prevData) => {
        const newData = [...prevData, {time: new Date().toLocaleTimeString(), temp: djangoData.temperature, humi: djangoData.humidity}];
        console.log(newData)
        if (newData.length > 10) {
          return newData.slice(newData.length - 10);
        }
        return newData;
      });
    }
    return () => {
      socket.close();
    };
  }, []);

  useEffect(
    () => {
      const connectWebSocket = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/relay/');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        setStatus(Number(message));
        console.log(message);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(() => {
          console.log('Reconnecting...');
          connectWebSocket(); // Attempt to reconnect
        }, reconnectInterval.current);
      };
    };

    connectWebSocket(); // Initial connection

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
    }, []
  )

  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.send(message);
    } else {
      console.error('Socket is not initialized');
    }
  };
  const handleClick = () => {
    const myMessage = 1 - status;
    setStatus(1 - status)
    sendMessage(myMessage);
  };



  return (
    // <ResponsiveContainer width="100%" height="80%">
    //   <LineChart
    //     data={data}
    //     margin={{
    //       top: 5, right: 50, left: 20, bottom: 5,
    //     }}
    //   >
    //     <CartesianGrid strokeDasharray="3 3" />
    //     <XAxis dataKey="time" />
    //     <YAxis domain={[ parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1)) - 0.25,  parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1)) + 0.25]} />
    //     <Tooltip />
    //     <Legend />
    //     <Line type="monotone" dataKey="temp" stroke="#8884d8" activeDot={{ r: 8 }} />
    //   </LineChart>
    // </ResponsiveContainer>
    <>
      <Box m="20px">
        <Box sx={{
          display: 'grid', 
          gridTemplateColumns: "repeat(12, 1fr)", 
          gridAutoRows: '140px',
          gap: '20px',
        }}>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ThermostatIcon fontSize="large"/><div id="temp"></div>℃ 
          </Box>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <OpacityIcon fontSize="large"/><div id="humid"></div>%
          </Box>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ParkIcon fontSize="large"/><div id="soil"></div>%
          </Box>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Button onClick={handleClick}>
              {
                status === 1 ? 'OFF' : 'ON'
              }
            </Button>
          </Box>
          <Box sx={{
            gridColumn: 'span 6',
            gridRow: 'span 3',
            bgcolor: colorBox,
          }}>
            <Box sx={{
              mt: '25px',
              p: '0 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h5" fontWeight="600">Nhiệt độ theo thời gian</Typography>
              </Box>
            </Box>
            <Box height="500px" m="0 0 0 0">
              <ResponsiveContainer width="100%" height="80%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20, right: 50, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="time"/>
                  <YAxis domain={[parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1))-0.25, parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1))+0.25]}/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="temp" stroke="#8884d8" activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box sx={{
            gridColumn: 'span 6',
            gridRow: 'span 3',
            bgcolor: colorBox,
          }}>
            <Box sx={{
              mt: '25px',
              p: '0 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h5" fontWeight="600">Độ ẩm theo thời gian</Typography>
              </Box>
            </Box>
            <Box height="500px" m="0 0 0 0">
              <ResponsiveContainer width="100%" height="80%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20, right: 50, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="time"/>
                  <YAxis domain={[parseFloat(Math.min(...data.map(item => item.humi)).toFixed(1))-0.25, parseFloat(Math.min(...data.map(item => item.humi)).toFixed(1))+0.25]}/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="humi" stroke="#8884d8" activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box sx={{
            gridColumn: 'span 4',
            gridRow: 'span 2',
            bgcolor: colorBox,
            p: "30px"
          }}>
            <Typography variant='h5' fontWeight='600'>
              Campaign
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: '25px'
            }}>
              <Typography variant="h5" sx={{mt: "15px"}}>
                $48,352 revenue generated
              </Typography>
              <Typography>Includes extra misc expenditures and costs</Typography>
            </Box>
          </Box>
          <Box sx={{
            gridColumn: 'span 4',
            gridRow: 'span 2',
            bgcolor: colorBox,
          }}>
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{ padding: "30px 30px 0 30px" }}
            >
              Sales Quantity
            </Typography>
            <Box height="250px" mt="-20px">
            </Box>
          </Box>
          <Box sx={{
            gridColumn: 'span 4',
            gridRow: 'span 2',
            bgcolor: colorBox,
            padding: "30px"
          }}>
            <Typography variant="h5" fontWeight="600" sx={{ marginBottom: "15px" }}>
              Geography Based Traffic
            </Typography>
            <Box height="200px">
            </Box>
          </Box>
      </Box>
    </Box>
    </>
  );
};

