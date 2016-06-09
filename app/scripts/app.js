import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import uuid from 'node-uuid'

const FAILPOINT = 65

const mountNode = document.getElementById('app')

const List = React.createClass({
  onBlur(i, e) {
    const value = e.target.value
    const field = e.target.name
    this.props.onBlur(i, field, value)
  },

  isFailing(grade) {
    return grade < FAILPOINT ? 'bg-danger' : ''
  },

  render() {
    const createItems = (item, i) => {
      const failing = this.isFailing(item.grade)

      return (
        <li key={item.id} className={classNames('form-inline', failing)}>
          <input
            name="name"
            className="form-control"
            onBlur={this.onBlur.bind(this, i)}
            defaultValue={item.name}
            type="text" pattern=".{1,}" title="1 characters minimum" required />
          <input
            name="grade"
            className="form-control"
            onBlur={this.onBlur.bind(this, i)}
            defaultValue={item.grade}
            type="number" min="0" max="100" step="1" required />

          <a id={item.id} onClick={this.props.onDeleteGrade}  className="form-control remove" title="Delete">
            <span className="glyphicon glyphicon-remove"></span>
            <span className="sr-only">Remove</span>
          </a>
        </li>
      )
    }
    if (this.props.items.length) {
      return (<ul className="list-unstyled">{this.props.items.map(createItems)}</ul>)
    } else {
      return null
    }
  }
})


var App = React.createClass({
  getInitialState() {
    return { items: [] }
  },

  clearInputs() {
    this.refs.name.value = ''
    this.refs.grade.value = ''
  },

  onDeleteGrade(e) {
    const id = e.currentTarget.id
    const newItems = this.state.items.filter( item => item.id !== id )
    this.setState({ items: newItems })
  },

  onClick(e) {
    e.preventDefault()

    const newItem = {
      id: uuid.v1(),
      name: this.refs.name.value,
      grade: parseInt(this.refs.grade.value, 10)
    }

    this.clearInputs()

    const newItems = this.state.items.concat([newItem])

    this.setState({items: newItems})
  },

  onBlur(i, field, value) {

    // deep clone array
    const newItems = JSON.parse(JSON.stringify(this.state.items))

    // this is weak sauce. optimize later
    if (field === "name") {
      newItems[i].name = value
    } else {
      newItems[i].grade = parseInt(value, 10)
    }

    this.setState({items: newItems})
  },

  render() {
    // console.log('render, state is:', this.state.items)

    return (
      <div>
        <form className="form-inline form-add-new" onSubmit={this.onClick}>
          <div className="row">
            <div className="col-sm-4">
              <input name="name" ref="name" placeholder="Enter a name" className="form-control" type="text" pattern=".{1,}" required title="1 characters minimum" />
            </div>
            <div className="col-sm-8">
              <div className="input-group">
              <input name="grade" ref="grade" placeholder="Enter a grade" className="form-control" type="number" min="0" max="100" step="1" required /><span className="input-group-addon">%</span>
              </div>

              <button className="btn btn-success">Add New Grade</button>
            </div>
          </div>

        </form>

        <List onBlur={this.onBlur} items={this.state.items} onDeleteGrade={this.onDeleteGrade}/>

        <Footer items={this.state.items}/>
      </div>
    )
  }
})


const Footer = React.createClass({
  calculate(items) {
    let sum, grades, min, max, avg

    if (items.length) {
      grades = items.map( item => item.grade )

      sum = grades.reduce( (prev, cur) => prev + cur )

      min = Math.min(...grades)
      max = Math.max(...grades)
      avg = Math.round( sum / grades.length )
    }
    return { min: min, max: max, avg: avg }
  },

  render() {
    const stats = this.calculate(this.props.items)

    return (
      <footer className="text-center">
        <div className="row">
          <div className="col-sm-4"><h4>Low</h4>{stats.min}</div>
          <div className="col-sm-4"><h4>Average</h4>{stats.avg}</div>
          <div className="col-sm-4"><h4>High</h4>{stats.max}</div>
        </div>
      </footer>
    )
  }
})



ReactDOM.render(<App />, mountNode);
