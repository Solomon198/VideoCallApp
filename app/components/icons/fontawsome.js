import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'


export default class FontAwsome extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}