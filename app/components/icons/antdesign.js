import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/AntDesign'


export default class AntDesign extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}