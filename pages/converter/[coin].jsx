import ConverterDetail from '@views/converter/detail';

const converterPageDetail = ({ fromCount, fromName, toName }) => {
    return (
        <ConverterDetail fromCount={fromCount} fromName={fromName} toName={toName} />
    );
};

export default converterPageDetail;

export async function getServerSideProps(ctx) {
    // https://www.example.com/us/converter/12-BTC-to-IDR
    let arr = ctx?.query?.coin?.split('-') || []
    // url 没有数量 默认是1
    if (arr.length === 3) {
        arr.unshift(1)
    }
    // 将数据作为props传递给页面组件
    return {
        props: {
            fromCount: parseFloat(arr[0]) || 1,
            fromName: arr[1]?.toUpperCase() || '',
            toName: arr[3]?.toUpperCase() || ''
        }
    };
};