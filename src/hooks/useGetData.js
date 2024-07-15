import baseUrl from '../Api/baseURL'


const useGetData = async (url, parmas) => {
// performing an HTTP GET request to the the specified url using the baseUrl object
//awaits the response and assigns it to the variable res
    const res = await baseUrl.get(url, parmas);
    return res.data;
}


const useGetDataToken = async (url, parmas) => {
    const config = {
        //authorization token retrieved from the local storage
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }
    const res = await baseUrl.get(url, config);
    return res.data;
}

export { useGetData, useGetDataToken };