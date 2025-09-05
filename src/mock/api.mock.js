import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import data from '../data.json'

const mock = new MockAdapter(axios, { delayResponse: 400 })


mock.onGet('/api/shareholders').reply(200, {
  items: data
})
