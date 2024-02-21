import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Select from 'react-select';
import { HiSwitchHorizontal, HiSun, HiMoon } from 'react-icons/hi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';

function App() {
  const [info, setInfo] = useState({});
  const [input, setInput] = useState(0);
  const [from, setFrom] = useState('usd');
  const [to, setTo] = useState('uah');
  const [options, setOptions] = useState([]);
  const [output, setOutput] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [graphMode, setGraphMode] = useState('1week');
  const [news, setNews] = useState([]);
  document.title = 'Currency Converter'
  
  useEffect(() => {
    
    const newsApiKey = 'API_KEY';
    const newsApiUrl = `https://newsapi.org/v2/everything?q=finance&apiKey=${newsApiKey}`;
  
    Axios.get(newsApiUrl)
      .then((res) => {
        setNews(res.data.articles);
      });
  }, []);


  useEffect(() => {
    console.log('Fetching currency data for', from);
  
    Axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from}.json`)
      .then((res) => {
        console.log('Currency data response:', res.data);
  
        setInfo(res.data[from]);
  
       
      })
      .catch((error) => {
        console.error(`Error fetching currency data: ${error}`);
      });
  }, [from]);
  
  useEffect(() => {
    console.log('Converting...', input, from, to);
    var rate = info[to];
    console.log('Conversion rate:', rate);
    setOutput(input * rate);
  }, [info, input, to]);
  
  useEffect(() => {
    setOptions(Object.keys(info));
    convert();
  }, [info, to]);

  useEffect(() => {
    fetchHistoricalData();
  }, [graphMode, from]);


  function convert() {
    var rate = info[to];
    setOutput(input * rate);
  }

  function flip() {
    var temp = from;
    setFrom(to);
    setTo(temp);
  }
  

  useEffect(() => {
   
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    
    document.body.style.backgroundColor = isDarkTheme ? '#1d1d1d' : '#fdfbfb';
  }, [isDarkTheme]);
  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  
   
    const htmlElement = document.querySelector('html');
  
    if (htmlElement) {
      htmlElement.style.backgroundColor = isDarkTheme ? '#fdfbfb' : '#1d1d1d'; 
    }
  };
  


  function fetchHistoricalData() {
    const today = new Date();
    let startDate = new Date();
  
    switch (graphMode) {
      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7); 
        break;
    }
  
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(today);
  
    const requests = [];
    const requestDates = [];
  
    for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
      const formattedDate = formatDate(date);
      requestDates.push(formattedDate);
      const request = Axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${formattedDate}/currencies/${from}.json`);
      requests.push(request);
    }
  
    console.log('Requesting data for dates:', requestDates);
  
    Promise.all(requests)
      .then((responses) => {
        const dataForChart = responses.map((res, index) => {
          const date = formatDate(startDate, index);
          const rate = res.data[from][to] || 0; 
          return {
            date,
            rate,
          };
        });
  
        setHistoricalData(dataForChart);
      })
      .catch((error) => {
        console.error(`Error fetching historical data: ${error}`);
      });
  }
  
  


function formatDate(date, offset = 0) {
  const formattedDate = new Date(date);
  formattedDate.setDate(date.getDate() + offset);
  return `${formattedDate.getFullYear()}-${String(formattedDate.getMonth() + 1).padStart(2, '0')}-${String(formattedDate.getDate()).padStart(2, '0')}`;
}
  const chartData = historicalData.map((dataPoint) => ({
    date: dataPoint.date,
    rate: dataPoint.rate,
  }));
  const customStyles = {
    control: (base, state) => ({
      ...base,
      color: isDarkTheme ? '#333' : '#333', 
    }),
    option: (base, state) => ({
      ...base,
      color: state.isSelected ? '#333' : '#333', 
      backgroundColor: state.isSelected
        ? '#007BFF'
        : state.isFocused
        ? '#007BFF1A'
        : 'transparent', 
    }),
    singleValue: (base, state) => ({
      ...base,
      color: isDarkTheme ? '#333' : '#333', 
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDarkTheme ? '#333' : '#333', 
    }),
  };

  function NewsCard({ title, content, url, urlToImage, publishedAt, source }) {
    
    const defaultImage = 'https://iat.kpi.ua/wp-content/uploads/2019/10/news-3.jpg';
    const imageUrl = urlToImage || defaultImage;
  
    return (
      <div className="card">
        <img className="news-image" src={imageUrl} alt="News Thumbnail" />
        <div className="news-details">
          <h3>{title}</h3>
          <p>{content}</p>
          
          <a href={url} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="card">
        <div className="heading">
          <h1>Currency Converter</h1>
        </div>
        <button className="toggle-theme-btn" onClick={toggleTheme}>
          {isDarkTheme ? <HiSun /> : <HiMoon />}
        </button>
          <h3>Amount</h3>
        <div className="input">
          <input
            type="text"
            className="input-field"
            placeholder="Enter the amount"
            value={input}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
              setInput(sanitizedValue);
            }}
            onKeyDown={(e) => {
              if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode === 8)) {
                e.preventDefault();
              }
            }}
          />
          <div className="result">
            <p>{`${input} ${from} = ${output.toFixed(2)} ${to}`}</p>
          </div>
        </div>
        <div className="select-container">
          <div className="select">
            <h3>From</h3>
            <Select
              options={options.map((opt) => ({ value: opt, label: opt }))}
              onChange={(e) => setFrom(e.value)}
              value={{ value: from, label: from }}
              styles={customStyles}
            />
          </div>
          <div className="switch" onClick={flip}>
            <HiSwitchHorizontal size="30px" />
          </div>
          <div className="select">
            <h3>To</h3>
            <Select
              options={options.map((opt) => ({ value: opt, label: opt }))}
              onChange={(e) => setTo(e.value)}
              value={{ value: to, label: to }}
              styles={customStyles}
            />
          </div>
        </div><div className="chart-container">
        <div className="graph-modes">
  <button className="mode"  onClick={() => setGraphMode('1week')}>1 Week</button>
  <button className="mode" onClick={() => setGraphMode('1month')}>1 Month</button>
  
</div>
        <LineChart width={300} height={300} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip
    labelFormatter={(value) => `Date: ${value}`}
    labelStyle={{ color: isDarkTheme ? '#333' : '#333' }}
    itemStyle={{ color: isDarkTheme ? '#333' : '#333' }}
  />
  <Legend />
  <Line
    type="monotone"
    dataKey="rate"
    name={`${from}/${to} Exchange Rate`}
    stroke="#8884d8"
    strokeWidth={2}
    dot={false}
    fill={false}
  />
</LineChart>

        </div>
        
      </div>
      <div className={` ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
  {news.map((newsItem) => (
    <NewsCard
      key={newsItem.url}
      title={newsItem.title}
      content={newsItem.description}
      url={newsItem.url}
      urlToImage={newsItem.urlToImage}
      publishedAt={newsItem.publishedAt}
      source={newsItem.source}
    />
  ))}
</div>
    </div>
  );
}

export default App;
