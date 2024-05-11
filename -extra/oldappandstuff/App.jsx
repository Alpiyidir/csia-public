import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props)
    this.state={apiResponse: ""};
  }
  
  async callAPI() {
    const res = await fetch("http://localhost:9000")
    const data = await res.json()
    const apiStatus = data.apiStatus
    this.setState({apiResponse: apiStatus})
  }
  

  componentDidMount() {
    this.callAPI();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            {this.state.apiResponse}
          </p>
        </header>
      </div>
    );
  };
};

export default App;
