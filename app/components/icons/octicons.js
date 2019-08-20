import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/Octicons'


export default class Octicons extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}