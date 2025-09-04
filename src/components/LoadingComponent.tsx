export const LoadingComponent = () => {
  return (
    <div className="flex justify-start mt-4">
      <div className="bg-transparent text-gray-200 rounded-lg rounded-bl-none max-w-xs md:max-w-md">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-[#bcbcbc] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#bcbcbc] rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-[#bcbcbc] rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
};
