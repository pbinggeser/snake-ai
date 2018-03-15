import React from 'react';
import '../../styles/switch.css';

export interface ISwitchProps {
  value: boolean;
  label: string;
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/17829
  onToggle: () => any; 
}

const Switch: React.SFC<ISwitchProps> = (props) => {
  return(    
    <span className={'switch' + (props.value ? ' active' : '')} onClick={props.onToggle}>
      <span className="switch-label"> {props.label} </span>
      <i className={`fa fa-fw fa-toggle-${props.value ? 'on' : 'off'}`}/>
    </span>
  );
};

export default Switch;
