import axios from 'axios';

const api=axios.create({
    url:'http://localhost:3030/api/v1',
    withCredentials:true,
})

export default api;