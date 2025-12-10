import React, { Component } from 'react';
import red from '../../images/red_light.png';
import yellow from '../../images/yellow_light.png';
import green from '../../images/green_light.png';


export default class Trafficlight extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const color = this.props.color;
    let newColor;
    if(color === 'red'){
      newColor = red;
    }
    if(color === 'yellow'){
      newColor = yellow
    }
    if(color === 'green'){
      newColor = green
    }

    return (
      <div>
        <img
          src={newColor}
          alt="light"
          style={{
            width: '20px' //, position: 'absolute', top: -10, left: 0
          }}
        />
        <h1 style={{position: 'absolute', right: 5, top: 0, background: '#ecf0f1', width: 70, textAlign: 'center', padding: 5, borderRadius: 5, border: '1px solid #ddd'}}>{this.props.count} 🚗</h1>

      </div>
    );
  }
}
