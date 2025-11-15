import { ThreeDots } from 'react-loading-icons'

interface Props {
  hasOverlay?: boolean
}

export const LoadingComponent = ({
  hasOverlay = true,
}: Props) => {
  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center w-full h-screen overflow-hidden">
      {hasOverlay && (
        <div 
          className={'fixed inset-0 w-screen h-full bg-black/60'} 
        />
      )}
      <ThreeDots height={'12px'} className="animate-spin" />
    </div>
  )
}