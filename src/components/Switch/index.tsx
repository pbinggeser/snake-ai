// todo write
import React from 'react';
import '../../styles/switch.css';

export interface ISwitchProps {
  value: boolean;
  label: string;
  onToggle: () => void;
}

const Switch = ({value, label, onToggle}: ISwitchProps) => (
  <span className={'switch' + (value ? ' active' : '')} onClick={onToggle}>
    <span className="switch-label"> {label} </span>
    {
      value ? (<i className="fa fa-toggle-on fa-fw" />) : (<i className="fa fa-toggle-off fa-fw" />)
    }
  </span>
);

export default Switch;
