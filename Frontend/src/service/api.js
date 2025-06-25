import axios from 'axios';

const api=axios.create({
    //baseURL:'http://localhost:3030/api/v1',
   baseURL:'https://job-board-1-fch2.onrender.com/api/v1',
    withCredentials:true,
})

export default api;