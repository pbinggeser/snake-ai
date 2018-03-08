import React, { Component } from 'react';
import '../styles/switch.css';

interface ISwitchProps {
  value: boolean;
  label: string;
  onToggle: () => void;
}

class Switch extends Component<ISwitchProps, object> {
  render() {
    return (
      <span className={'switch' + (this.props.value ? ' active' : '')} onClick={this.props.onToggle}>
        <span className="switch-label">
          {this.props.label}
        </span>
        {
          this.props.value ?
            (<i className="fa fa-toggle-on fa-fw" />) :
            (<i className="fa fa-toggle-off fa-fw" />)
        }
      </span>
    );
  }

}

export default Switch;
