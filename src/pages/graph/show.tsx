import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Box, Typography, useTheme } from "@mui/material";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import ParkIcon from '@mui/icons-material/Park';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import i18n from "i18next";
export const BlogShowGraph = () => {
  const [data, setData] = useState<{ time: string, temp: number, humi: number}[]>([]);
  const [water, setWater] = useState<{ time: string, mlwater: number}[]>([]);
  const theme = useTheme()
  const [colorBox, setColorBox] = useState('#1F2A40')
  const [status1, setStatus1] = useState(0)
  const [status2, setStatus2] = useState(0)
  const socketRef1 = useRef(null);
  const socketRef2 = useRef(null);
  const reconnectInterval = useRef(1000); 
  const [manualMode, setManualMode] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [crop, setCrop] = useState('');
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
        const newData = [...prevData, {time: djangoData.time, temp: djangoData.temperature, humi: djangoData.humidity}];
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

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/water/');
    socket.onmessage = function(e){
      const waterdata = JSON.parse(e.data);
      const result: { time: string, mlwater: number }[] = Object.entries(waterdata['DayWater']).map(([key, value]) => ({
        'time': value as string,
        'mlwater': Number(waterdata['Water'][key])
      }));
      setWater(result);
      console.log(waterdata);
    }
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/relay/');
      socketRef1.current = socket;

      socket.onopen = () => {
        console.log('WebSocket manual connected');
      };

      socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        setStatus1(Number(message));
        console.log('status1', message);
      };

      socket.onclose = () => {
        console.log('WebSocket connection manual closed');
        setTimeout(() => {
          console.log('Reconnecting...');
          connectWebSocket(); // Attempt to reconnect
        }, reconnectInterval.current);
      };
    };

    connectWebSocket(); // Initial connection

    return () => {
      if (socketRef1.current) {
        socketRef1.current.close();
      }
    };
    }, 
  [])
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/auto/');
      socketRef2.current = socket;

      socket.onopen = () => {
        console.log('WebSocket auto connected');
      };

      socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        setStatus2(Number(message));
        console.log('status2', message);
      };

      socket.onclose = () => {
        console.log('WebSocket connection auto closed');
        setTimeout(() => {
          console.log('Reconnecting...');
          connectWebSocket(); // Attempt to reconnect
        }, reconnectInterval.current);
      };
    };

    connectWebSocket(); // Initial connection

    return () => {
      if (socketRef2.current) {
        socketRef2.current.close();
      }
    };
  }, [])
    

  const sendMessage1 = (message) => {
    if (socketRef1.current) {
      socketRef1.current.send(message);
    } else {
      console.error('Socket is not initialized');
    }
  };
  const sendMessage2 = (message) => {
    if (socketRef2.current) {
      socketRef2.current.send(message);
    } else {
      console.error('Socket is not initialized');
    }
  };
  const handleChangeManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    const myMessage = 1 - status1;
    if(status1 === 0){
      setStatus2(0)
      sendMessage2(0)
    }
    setStatus1(1 - status1);
    setManualMode(!manualMode);
    sendMessage1(myMessage);
  };

  const handleChangeAuto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const myMessage = String(1 - status2)+" "+crop;
    if(status2 === 0){
      setStatus1(0)
      sendMessage1(0)
    }
    setStatus2(1 - status2);
    setAutoMode(!autoMode);
    sendMessage2(myMessage);
  };
  const handleSelect = (event: SelectChangeEvent) => {
    setCrop(event.target.value);
  };

  return (
    <>
      <Box m="20px">
        <Box sx={{
          display: 'grid', 
          gridTemplateColumns: "repeat(12, 1fr)", 
          gridAutoRows: '140px',
          gap: '20px',
        }}>
          <Box sx={{
            gridColumn: 'span 2',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="h6" fontWeight="600">
              {i18n.language === 'en' ? ('Temperature ') : ('Nhiệt độ ')}
            </Typography>
            <ThermostatIcon fontSize="large"/><div id="temp"></div>℃ 
          </Box>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" fontWeight="600">
              {i18n.language === 'en' ? ('Humidity ') : ('Độ ẩm không khí ')}
            </Typography>
            <OpacityIcon fontSize="large"/><div id="humid"></div>%
          </Box>
          <Box sx={{
            gridColumn: 'span 2',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" fontWeight="600">
              {i18n.language === 'en' ? ('Soil Moisture ') : ('Độ ẩm đất ')}
            </Typography>
            <ParkIcon fontSize="large"/><div id="soil"></div>%
          </Box>
          <Box sx={{
            gridColumn: 'span 2',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FormControlLabel
              value="top"
              control={
                <Switch
                  checked={status1 == 1 ? true : false} 
                  onChange={handleChangeManual}
                />
              }
              label={<Typography variant="h6" fontWeight="600">{i18n.language === 'en' ? ('Manual') : ('Thủ công')}</Typography>}
              labelPlacement="top"
            />
          </Box>
          <Box sx={{
            gridColumn: 'span 3',
            bgcolor: colorBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FormControl sx={{ m: 1, minWidth: 120,}}>
              <InputLabel id="demo-simple-select-label">Crop</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={crop}
                label="Crop"
                onChange={handleSelect}
              >
                <MenuItem value={0}>Wheat</MenuItem>
                <MenuItem value={1}>Groundnuts</MenuItem>
                <MenuItem value={2}>Garden Flower</MenuItem>
                <MenuItem value={3}>Maize</MenuItem>
                <MenuItem value={4}>Paddy</MenuItem>
                <MenuItem value={5}>Potato</MenuItem>
                <MenuItem value={6}>Pulse</MenuItem>
                <MenuItem value={7}>Sugarcane</MenuItem>
                <MenuItem value={8}>Coffee</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              value="top"
              control={
                <Switch
                  checked={status2 == 1 ? true : false} 
                  onChange={handleChangeAuto}
                />
              }
              label={<Typography variant="h6" fontWeight="600">{i18n.language === 'en' ? ('Auto') : ('Tự động')}</Typography>}
              labelPlacement="top"
            />
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
                <Typography variant="h5" fontWeight="600">
                  {i18n.language === 'en' ? ('Historical Temperature') : ('Nhiệt độ theo thời gian')}
                </Typography>
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
                  <XAxis dataKey="time" strokeWidth={2}/>
                  <YAxis domain={[parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1))-0.25, parseFloat(Math.min(...data.map(item => item.temp)).toFixed(1))+0.25]} strokeWidth={2}/>
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
                <Typography variant="h5" fontWeight="600">
                  {i18n.language === 'en' ? ('Historical Humidity') : ('Độ ẩm theo thời gian')}
                </Typography>
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
                  <XAxis dataKey="time" strokeWidth={2}/>
                  <YAxis domain={[parseFloat(Math.min(...data.map(item => item.humi)).toFixed(1))-0.25, parseFloat(Math.min(...data.map(item => item.humi)).toFixed(1))+0.25]} strokeWidth={2}/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="humi" stroke="#8884d8" activeDot={{r: 8}} />
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
                <Typography variant="h5" fontWeight="600">
                  {i18n.language === 'en' ? ('Volume of water by day') : ('Lượng nước theo ngày')}
                </Typography>
              </Box>
            </Box>
            <Box height="500px" m="0 0 0 0">
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={water} margin={{
                    top: 20, right: 50, left: 20, bottom: 5,
                  }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" strokeWidth={2}/>
                  <YAxis strokeWidth={2}/>
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mlwater" fill="#8884d8" />
                  {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box sx={{
            gridColumn: 'span 6',
            gridRow: 'span 3',
            bgcolor: colorBox,
          }}>
            <Typography variant="h5" fontWeight="600" sx={{ padding: "30px 30px 0 30px" }}>
            </Typography>
            <Box height="250px" mt="-20px">
            </Box>
          </Box>
      </Box>
    </Box>
    </>
  );
};
