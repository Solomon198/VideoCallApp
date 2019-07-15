import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/Foundation'


export default class Foundation extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}