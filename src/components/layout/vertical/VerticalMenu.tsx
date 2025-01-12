// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { menuUrls } from '@/@menu/utils/menuUrls'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()

  const verticalNavOptions = useVerticalNav()

  const params = useParams()

  const pathname = usePathname()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const { lang: locale, id, slideId } = params

  const navigationTranslate = dictionary['navigation']

  const keywordsTranslate = dictionary['keywords']

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Dashboard */}

        <MenuItem
          href={`/${locale}`}
          icon={<i className='ri-dashboard-line text-[20px]' />}
          title={navigationTranslate.dashboard}
        >
          {navigationTranslate.dashboard}
        </MenuItem>

        <MenuSection label={navigationTranslate.hospitals}>
          <MenuItem
            href={`/${locale}${menuUrls.hospitals.list}`}
            icon={<i className='ri-list-unordered text-[20px]' />}
            title={keywordsTranslate.list}
          >
            {keywordsTranslate.list}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.hospitals.add}`}
            icon={<i className='ri-add-box-line text-[20px]' />}
            title={keywordsTranslate.add}
          >
            {keywordsTranslate.add}
          </MenuItem>
          {/* <SubMenu label={navigationTranslate.brand} icon={<i className='ri-price-tag-3-line text-[20px]' />}>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <SubMenu
            label={navigationTranslate.attribute_attribute_values}
            title={navigationTranslate.attribute_attribute_values}
            icon={<i className='ri-checkbox-line text-[20px]' />}
          >
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}${menuUrls.product_management.attributesGroup.list}`}
            icon={<i className='ri-checkbox-multiple-line text-[20px]' />}
            title={navigationTranslate.attribute_groups}
          >
            {navigationTranslate.attribute_groups}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-inbox-line text-[20px]' />}
            title={navigationTranslate.products}
            href={`/${locale}${menuUrls.product_management.products.list}`}
          >
            {navigationTranslate.products}
          </MenuItem>
          <MenuItem
            title={navigationTranslate.pricing_plans}
            icon={<i className='ri-price-tag-2-line text-[20px]' />}
            href={`/${locale}${menuUrls.product_management.pricing_plans.list}`}
          >
            {navigationTranslate.pricing_plans}
          </MenuItem>
          <MenuItem
            href={`/${locale}${menuUrls.product_management.tag.list}`}
            icon={<i className='ri-price-tag-line text-[20px]' />}
            title={navigationTranslate.tags}
          >
            {navigationTranslate.tags}
          </MenuItem> */}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
